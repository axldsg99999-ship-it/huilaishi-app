begin;

create or replace function private.consume_rate_limit(
  p_subject_id uuid,
  p_action text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_window timestamptz;
  v_count integer;
begin
  if p_subject_id is null
     or p_action is null
     or p_limit < 1
     or p_window_seconds < 1 then
    return false;
  end if;

  v_window := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );

  insert into private.rate_buckets (
    subject_id,
    action,
    window_started_at,
    request_count
  ) values (
    p_subject_id,
    left(p_action, 64),
    v_window,
    1
  )
  on conflict (subject_id, action, window_started_at)
  do update
    set request_count = private.rate_buckets.request_count + 1
    where private.rate_buckets.request_count < p_limit
  returning request_count into v_count;

  return v_count is not null;
end;
$$;

create or replace function private.is_conversation_member(
  p_conversation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    where cp.conversation_id = p_conversation_id
      and cp.user_id = p_user_id
  );
$$;

create or replace function private.is_active_conversation_member(
  p_conversation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants cp
    join public.conversations c on c.id = cp.conversation_id
    where cp.conversation_id = p_conversation_id
      and cp.user_id = p_user_id
      and cp.left_at is null
      and c.state = 'active'
  );
$$;

create or replace function private.shares_conversation(
  p_first_user_id uuid,
  p_second_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants first_member
    join public.conversation_participants second_member
      on second_member.conversation_id = first_member.conversation_id
    where first_member.user_id = p_first_user_id
      and second_member.user_id = p_second_user_id
  );
$$;

create or replace function private.is_blocked_between(
  p_first_user_id uuid,
  p_second_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_blocks b
    where (b.blocker_id = p_first_user_id and b.blocked_id = p_second_user_id)
       or (b.blocker_id = p_second_user_id and b.blocked_id = p_first_user_id)
  );
$$;

create or replace function private.is_blocked_in_conversation(
  p_conversation_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_participants other_member
    join public.user_blocks b
      on (b.blocker_id = p_user_id and b.blocked_id = other_member.user_id)
      or (b.blocker_id = other_member.user_id and b.blocked_id = p_user_id)
    where other_member.conversation_id = p_conversation_id
      and other_member.user_id <> p_user_id
  );
$$;

create or replace function private.assert_can_exchange(
  p_conversation_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_account_state public.account_state;
begin
  -- Coordinate message/correction writes with close/block updates. A close that
  -- commits first is observed below; a close that waits happened after this
  -- exchange operation in transaction order.
  perform 1
  from public.conversations c
  where c.id = p_conversation_id
  for share;

  if not private.is_active_conversation_member(p_conversation_id, p_user_id) then
    raise exception using errcode = '42501', message = 'conversation_not_active_or_not_member';
  end if;

  select p.account_state into v_account_state
  from public.profiles p
  where p.id = p_user_id;

  if v_account_state is distinct from 'active'::public.account_state then
    raise exception using errcode = '42501', message = 'account_not_active';
  end if;

  if private.is_blocked_in_conversation(p_conversation_id, p_user_id) then
    raise exception using errcode = '42501', message = 'conversation_blocked';
  end if;
end;
$$;

create or replace function public.get_my_profile()
returns setof public.profiles
language sql
stable
security definer
set search_path = ''
as $$
  select p.*
  from public.profiles p
  where p.id = auth.uid();
$$;

create or replace function private.storage_conversation_id(p_object_name text)
returns uuid
language plpgsql
immutable
security definer
set search_path = ''
as $$
declare
  v_parts text[];
begin
  v_parts := string_to_array(p_object_name, '/');
  if coalesce(array_length(v_parts, 1), 0) <> 3 then
    return null;
  end if;
  return v_parts[2]::uuid;
exception when others then
  return null;
end;
$$;

create or replace function private.topic_conversation_id(p_topic text)
returns uuid
language plpgsql
immutable
security definer
set search_path = ''
as $$
begin
  if p_topic !~ '^conversation:[0-9a-fA-F-]{36}$' then
    return null;
  end if;
  return split_part(p_topic, ':', 2)::uuid;
exception when others then
  return null;
end;
$$;

create or replace function public.find_partner(p_device_id uuid)
returns table (
  match_status text,
  conversation_id uuid,
  partner_id uuid,
  partner_display_name text
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_candidate public.match_queue%rowtype;
  v_existing_conversation_id uuid;
  v_existing_partner_id uuid;
  v_conversation_id uuid;
  v_partner_name text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_device_id is null then
    raise exception using errcode = '22023', message = 'device_id_required';
  end if;
  if coalesce(auth.jwt() ->> 'is_anonymous', 'false') = 'true' then
    raise exception using errcode = '42501', message = 'verified_account_required';
  end if;
  if not private.consume_rate_limit(v_user_id, 'find_partner_minute', 8, 60) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_user_id::text, 0));

  select p.* into v_profile
  from public.profiles p
  where p.id = v_user_id
  for update;

  if not found then
    raise exception using errcode = 'P0001', message = 'profile_missing';
  end if;
  if v_profile.account_state <> 'active'
     or not v_profile.onboarding_complete
     or not v_profile.is_adult then
    raise exception using errcode = '42501', message = 'profile_not_eligible';
  end if;

  select q.matched_conversation_id into v_existing_conversation_id
  from public.match_queue q
  join public.conversations c on c.id = q.matched_conversation_id
  where q.user_id = v_user_id
    and q.state = 'matched'
    and c.state = 'active';

  if v_existing_conversation_id is not null then
    select cp.user_id, p.display_name
      into v_existing_partner_id, v_partner_name
    from public.conversation_participants cp
    join public.profiles p on p.id = cp.user_id
    where cp.conversation_id = v_existing_conversation_id
      and cp.user_id <> v_user_id
    limit 1;

    return query select
      'matched'::text,
      v_existing_conversation_id,
      v_existing_partner_id,
      v_partner_name;
    return;
  end if;

  insert into public.match_queue (
    user_id,
    native_language,
    learning_language,
    proficiency,
    state,
    entered_at,
    last_seen_at,
    expires_at,
    matched_conversation_id
  ) values (
    v_user_id,
    v_profile.native_language,
    v_profile.learning_language,
    v_profile.proficiency,
    'waiting',
    now(),
    now(),
    now() + interval '90 seconds',
    null
  )
  on conflict (user_id) do update
    set native_language = excluded.native_language,
        learning_language = excluded.learning_language,
        proficiency = excluded.proficiency,
        state = 'waiting',
        entered_at = case
          when public.match_queue.state = 'waiting'
           and public.match_queue.expires_at > now()
          then public.match_queue.entered_at
          else now()
        end,
        last_seen_at = now(),
        expires_at = now() + interval '90 seconds',
        matched_conversation_id = null;

  insert into public.user_presence (
    user_id,
    state,
    conversation_id,
    device_id,
    heartbeat_at,
    updated_at
  ) values (
    v_user_id,
    'online',
    null,
    p_device_id,
    now(),
    now()
  )
  on conflict (user_id) do update
    set state = 'online',
        conversation_id = null,
        device_id = excluded.device_id,
        heartbeat_at = now(),
        updated_at = now();

  select q.* into v_candidate
  from public.match_queue q
  join public.profiles p on p.id = q.user_id
  where q.user_id <> v_user_id
    and q.state = 'waiting'
    and q.expires_at > now()
    and q.last_seen_at > now() - interval '45 seconds'
    and q.native_language = v_profile.learning_language
    and q.learning_language = v_profile.native_language
    and p.account_state = 'active'
    and p.onboarding_complete
    and p.is_adult
    and not private.is_blocked_between(v_user_id, q.user_id)
  order by abs(q.proficiency - v_profile.proficiency), q.entered_at
  for update of q skip locked
  limit 1;

  if not found then
    return query select 'waiting'::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  if private.is_blocked_between(v_user_id, v_candidate.user_id) then
    return query select 'waiting'::text, null::uuid, null::uuid, null::text;
    return;
  end if;

  insert into public.conversations (state)
  values ('active')
  returning id into v_conversation_id;

  insert into public.conversation_participants (conversation_id, user_id)
  values
    (v_conversation_id, v_user_id),
    (v_conversation_id, v_candidate.user_id);

  update public.match_queue
  set state = 'matched',
      matched_conversation_id = v_conversation_id,
      last_seen_at = now(),
      expires_at = now() + interval '24 hours'
  where user_id in (v_user_id, v_candidate.user_id);

  update public.user_presence
  set conversation_id = v_conversation_id,
      updated_at = now()
  where user_id in (v_user_id, v_candidate.user_id)
    and heartbeat_at > now() - interval '90 seconds';

  select p.display_name into v_partner_name
  from public.profiles p
  where p.id = v_candidate.user_id;

  return query select
    'matched'::text,
    v_conversation_id,
    v_candidate.user_id,
    v_partner_name;
end;
$$;

create or replace function public.leave_match_queue()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  update public.match_queue
  set state = 'cancelled',
      matched_conversation_id = null,
      expires_at = now(),
      last_seen_at = now()
  where user_id = v_user_id
    and state = 'waiting';

  update public.user_presence
  set state = 'offline',
      conversation_id = null,
      heartbeat_at = now(),
      updated_at = now()
  where user_id = v_user_id;
end;
$$;

create or replace function public.heartbeat_presence(
  p_device_id uuid,
  p_state public.presence_state default 'online',
  p_conversation_id uuid default null
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_device_id is null then
    raise exception using errcode = '22023', message = 'device_id_required';
  end if;
  if p_conversation_id is not null
     and not private.is_conversation_member(p_conversation_id, v_user_id) then
    raise exception using errcode = '42501', message = 'not_conversation_member';
  end if;
  if not private.consume_rate_limit(v_user_id, 'presence_minute', 12, 60) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.user_presence (
    user_id,
    state,
    conversation_id,
    device_id,
    heartbeat_at,
    updated_at
  ) values (
    v_user_id,
    p_state,
    case when p_state = 'offline' then null else p_conversation_id end,
    p_device_id,
    v_now,
    v_now
  )
  on conflict (user_id) do update
    set state = excluded.state,
        conversation_id = excluded.conversation_id,
        device_id = excluded.device_id,
        heartbeat_at = excluded.heartbeat_at,
        updated_at = excluded.updated_at;

  if p_state <> 'offline' then
    update public.match_queue
    set last_seen_at = v_now,
        expires_at = v_now + interval '90 seconds'
    where user_id = v_user_id
      and state = 'waiting';
  end if;

  return v_now;
end;
$$;

create or replace function public.send_text_message(
  p_conversation_id uuid,
  p_text text,
  p_client_nonce uuid,
  p_reply_to_id uuid default null
)
returns setof public.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_text text := btrim(p_text);
  v_message public.messages%rowtype;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_client_nonce is null then
    raise exception using errcode = '22023', message = 'client_nonce_required';
  end if;

  select m.* into v_message
  from public.messages m
  where m.sender_id = v_user_id
    and m.client_nonce = p_client_nonce;
  if found then
    return next v_message;
    return;
  end if;

  if v_text is null or char_length(v_text) not between 1 and 1000 then
    raise exception using errcode = '22023', message = 'invalid_text_length';
  end if;

  perform private.assert_can_exchange(p_conversation_id, v_user_id);

  if p_reply_to_id is not null and not exists (
    select 1 from public.messages m
    where m.id = p_reply_to_id
      and m.conversation_id = p_conversation_id
  ) then
    raise exception using errcode = '22023', message = 'invalid_reply_target';
  end if;
  if not private.consume_rate_limit(v_user_id, 'text_minute', 30, 60)
     or not private.consume_rate_limit(v_user_id, 'message_day', 500, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.messages (
    conversation_id,
    sender_id,
    kind,
    text_content,
    reply_to_id,
    client_nonce
  ) values (
    p_conversation_id,
    v_user_id,
    'text',
    v_text,
    p_reply_to_id,
    p_client_nonce
  )
  returning * into v_message;

  return next v_message;
end;
$$;

create or replace function public.prepare_voice_upload(
  p_conversation_id uuid,
  p_mime_type text,
  p_duration_ms integer,
  p_size_bytes integer,
  p_client_nonce uuid
)
returns table (object_path text, expires_in_seconds integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_extension text;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_client_nonce is null then
    raise exception using errcode = '22023', message = 'client_nonce_required';
  end if;
  if p_duration_ms not between 250 and 120000
     or p_size_bytes not between 1 and 5242880 then
    raise exception using errcode = '22023', message = 'invalid_voice_limits';
  end if;

  v_extension := case p_mime_type
    when 'audio/webm' then 'webm'
    when 'audio/ogg' then 'ogg'
    when 'audio/mp4' then 'm4a'
    when 'audio/x-m4a' then 'm4a'
    when 'audio/mpeg' then 'mp3'
    when 'audio/wav' then 'wav'
    else null
  end;
  if v_extension is null then
    raise exception using errcode = '22023', message = 'unsupported_voice_type';
  end if;

  perform private.assert_can_exchange(p_conversation_id, v_user_id);
  if exists (
    select 1 from public.messages m
    where m.sender_id = v_user_id
      and m.client_nonce = p_client_nonce
  ) then
    raise exception using errcode = '23505', message = 'message_already_finalized';
  end if;
  if not private.consume_rate_limit(v_user_id, 'voice_ticket_minute', 10, 60)
     or not private.consume_rate_limit(v_user_id, 'voice_ticket_day', 100, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  return query select
    v_user_id::text || '/' || p_conversation_id::text || '/' || p_client_nonce::text || '.' || v_extension,
    7200;
end;
$$;

create or replace function public.finalize_voice_message(
  p_conversation_id uuid,
  p_object_path text,
  p_mime_type text,
  p_duration_ms integer,
  p_size_bytes integer,
  p_client_nonce uuid,
  p_transcript text default null,
  p_transcript_language public.language_code default null,
  p_reply_to_id uuid default null
)
returns setof public.messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_message public.messages%rowtype;
  v_actual_size bigint;
  v_transcript text := nullif(btrim(p_transcript), '');
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_client_nonce is null then
    raise exception using errcode = '22023', message = 'client_nonce_required';
  end if;

  select m.* into v_message
  from public.messages m
  where m.sender_id = v_user_id
    and m.client_nonce = p_client_nonce;
  if found then
    return next v_message;
    return;
  end if;

  if p_duration_ms not between 250 and 120000
     or p_size_bytes not between 1 and 5242880
     or p_mime_type not in (
       'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/x-m4a', 'audio/mpeg', 'audio/wav'
     ) then
    raise exception using errcode = '22023', message = 'invalid_voice_metadata';
  end if;
  if v_transcript is not null and char_length(v_transcript) > 1000 then
    raise exception using errcode = '22023', message = 'invalid_transcript_length';
  end if;
  if array_length(string_to_array(p_object_path, '/'), 1) <> 3
     or split_part(p_object_path, '/', 1) <> v_user_id::text
     or split_part(p_object_path, '/', 2) <> p_conversation_id::text
     or p_object_path like '%..%' then
    raise exception using errcode = '22023', message = 'invalid_voice_path';
  end if;

  perform private.assert_can_exchange(p_conversation_id, v_user_id);

  select case
    when coalesce(o.metadata ->> 'size', '') ~ '^[0-9]+$'
      then (o.metadata ->> 'size')::bigint
    else p_size_bytes::bigint
  end into v_actual_size
  from storage.objects o
  where o.bucket_id = 'voice-messages'
    and o.name = p_object_path;

  if not found then
    raise exception using errcode = '22023', message = 'voice_object_missing';
  end if;
  if v_actual_size < 1 or v_actual_size > 5242880 then
    raise exception using errcode = '22023', message = 'voice_object_too_large';
  end if;
  if p_reply_to_id is not null and not exists (
    select 1 from public.messages m
    where m.id = p_reply_to_id
      and m.conversation_id = p_conversation_id
  ) then
    raise exception using errcode = '22023', message = 'invalid_reply_target';
  end if;
  if not private.consume_rate_limit(v_user_id, 'voice_message_minute', 10, 60)
     or not private.consume_rate_limit(v_user_id, 'message_day', 500, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.messages (
    conversation_id,
    sender_id,
    kind,
    voice_object_path,
    voice_mime_type,
    voice_duration_ms,
    voice_size_bytes,
    transcript,
    transcript_language,
    reply_to_id,
    client_nonce
  ) values (
    p_conversation_id,
    v_user_id,
    'voice',
    p_object_path,
    p_mime_type,
    p_duration_ms,
    v_actual_size::integer,
    v_transcript,
    case when v_transcript is null then null else p_transcript_language end,
    p_reply_to_id,
    p_client_nonce
  )
  returning * into v_message;

  return next v_message;
end;
$$;

create or replace function public.submit_correction(
  p_source_message_id uuid,
  p_corrected_text text,
  p_note text,
  p_client_nonce uuid
)
returns setof public.corrections
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_message public.messages%rowtype;
  v_correction public.corrections%rowtype;
  v_text text := btrim(p_corrected_text);
  v_note text := nullif(btrim(p_note), '');
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_client_nonce is null then
    raise exception using errcode = '22023', message = 'client_nonce_required';
  end if;

  select c.* into v_correction
  from public.corrections c
  where c.author_id = v_user_id
    and c.client_nonce = p_client_nonce;
  if found then
    return next v_correction;
    return;
  end if;

  if v_text is null or char_length(v_text) not between 1 and 1000
     or (v_note is not null and char_length(v_note) > 500) then
    raise exception using errcode = '22023', message = 'invalid_correction_length';
  end if;

  select m.* into v_message
  from public.messages m
  where m.id = p_source_message_id;
  if not found or v_message.sender_id is null or v_message.sender_id = v_user_id then
    raise exception using errcode = '22023', message = 'invalid_correction_target';
  end if;

  perform private.assert_can_exchange(v_message.conversation_id, v_user_id);
  if not private.consume_rate_limit(v_user_id, 'correction_minute', 20, 60)
     or not private.consume_rate_limit(v_user_id, 'correction_day', 200, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.corrections (
    source_message_id,
    author_id,
    corrected_text,
    note,
    client_nonce
  ) values (
    p_source_message_id,
    v_user_id,
    v_text,
    v_note,
    p_client_nonce
  )
  returning * into v_correction;

  return next v_correction;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not private.is_conversation_member(p_conversation_id, v_user_id) then
    raise exception using errcode = '42501', message = 'not_conversation_member';
  end if;
  if not private.consume_rate_limit(v_user_id, 'mark_read_minute', 30, 60) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  update public.conversation_participants
  set last_read_at = v_now
  where conversation_id = p_conversation_id
    and user_id = v_user_id;
  return v_now;
end;
$$;

create or replace function public.block_user(
  p_blocked_user_id uuid,
  p_reason text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_reason text := nullif(btrim(p_reason), '');
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_blocked_user_id is null or p_blocked_user_id = v_user_id then
    raise exception using errcode = '22023', message = 'invalid_block_target';
  end if;
  if v_reason is not null and char_length(v_reason) > 300 then
    raise exception using errcode = '22023', message = 'invalid_block_reason';
  end if;
  if not exists (select 1 from public.profiles p where p.id = p_blocked_user_id) then
    raise exception using errcode = '22023', message = 'profile_missing';
  end if;
  if not private.consume_rate_limit(v_user_id, 'block_day', 50, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.user_blocks (blocker_id, blocked_id, reason)
  values (v_user_id, p_blocked_user_id, v_reason)
  on conflict (blocker_id, blocked_id) do update
    set reason = excluded.reason,
        created_at = now();

  update public.match_queue q
  set state = 'cancelled',
      matched_conversation_id = null,
      expires_at = now(),
      last_seen_at = now()
  where (
    q.user_id = v_user_id
    and q.state = 'waiting'
  ) or q.matched_conversation_id in (
    select cp.conversation_id
    from public.conversation_participants cp
    where cp.user_id = v_user_id
      and private.is_conversation_member(cp.conversation_id, p_blocked_user_id)
  );

  update public.conversations c
  set state = 'closed',
      closed_at = now()
  where c.state = 'active'
    and private.is_conversation_member(c.id, v_user_id)
    and private.is_conversation_member(c.id, p_blocked_user_id);

  update public.user_presence
  set state = 'offline',
      conversation_id = null,
      heartbeat_at = now(),
      updated_at = now()
  where user_id = v_user_id;

  return true;
end;
$$;

create or replace function public.unblock_user(p_blocked_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_deleted integer;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  delete from public.user_blocks
  where blocker_id = v_user_id
    and blocked_id = p_blocked_user_id;
  get diagnostics v_deleted = row_count;
  return v_deleted > 0;
end;
$$;

create or replace function public.submit_report(
  p_reported_user_id uuid,
  p_reason public.report_reason,
  p_details text default null,
  p_conversation_id uuid default null,
  p_message_id uuid default null,
  p_also_block boolean default true
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_details text := nullif(btrim(p_details), '');
  v_message_sender uuid;
  v_message_conversation uuid;
  v_report_id uuid;
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if p_reported_user_id is null or p_reported_user_id = v_user_id then
    raise exception using errcode = '22023', message = 'invalid_report_target';
  end if;
  if v_details is not null and char_length(v_details) > 1000 then
    raise exception using errcode = '22023', message = 'invalid_report_details';
  end if;
  if p_conversation_id is null then
    raise exception using errcode = '22023', message = 'report_conversation_required';
  end if;
  if (
    not private.is_conversation_member(p_conversation_id, v_user_id)
    or not private.is_conversation_member(p_conversation_id, p_reported_user_id)
  ) then
    raise exception using errcode = '42501', message = 'invalid_report_conversation';
  end if;

  if p_message_id is not null then
    select m.sender_id, m.conversation_id
      into v_message_sender, v_message_conversation
    from public.messages m
    where m.id = p_message_id;

    if not found
       or v_message_sender <> p_reported_user_id
       or p_conversation_id is null
       or v_message_conversation <> p_conversation_id then
      raise exception using errcode = '22023', message = 'invalid_report_message';
    end if;
  end if;
  if not private.consume_rate_limit(v_user_id, 'report_day', 10, 86400) then
    raise exception using errcode = 'P0001', message = 'rate_limited';
  end if;

  insert into public.reports (
    reporter_id,
    reported_user_id,
    conversation_id,
    message_id,
    reason,
    details
  ) values (
    v_user_id,
    p_reported_user_id,
    p_conversation_id,
    p_message_id,
    p_reason,
    v_details
  )
  returning id into v_report_id;

  if p_also_block then
    insert into public.user_blocks (blocker_id, blocked_id, reason)
    values (v_user_id, p_reported_user_id, 'report:' || p_reason::text)
    on conflict (blocker_id, blocked_id) do nothing;

    update public.conversations c
    set state = 'closed',
        closed_at = now()
    where c.state = 'active'
      and private.is_conversation_member(c.id, v_user_id)
      and private.is_conversation_member(c.id, p_reported_user_id);

    update public.match_queue q
    set state = 'cancelled',
        matched_conversation_id = null,
        expires_at = now(),
        last_seen_at = now()
    where (
      q.user_id = v_user_id
      and q.state = 'waiting'
    ) or q.matched_conversation_id in (
      select cp.conversation_id
      from public.conversation_participants cp
      where cp.user_id = v_user_id
        and private.is_conversation_member(cp.conversation_id, p_reported_user_id)
    );
  end if;

  return v_report_id;
end;
$$;

create or replace function public.close_conversation(p_conversation_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;
  if not private.is_conversation_member(p_conversation_id, v_user_id) then
    raise exception using errcode = '42501', message = 'not_conversation_member';
  end if;

  update public.conversations
  set state = 'closed',
      closed_at = now()
  where id = p_conversation_id
    and state = 'active';

  update public.match_queue
  set state = 'cancelled',
      matched_conversation_id = null,
      expires_at = now(),
      last_seen_at = now()
  where matched_conversation_id = p_conversation_id;

  update public.user_presence
  set state = 'offline',
      conversation_id = null,
      heartbeat_at = now(),
      updated_at = now()
  where user_id = v_user_id;

  return true;
end;
$$;

revoke all on function private.consume_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function private.assert_can_exchange(uuid, uuid) from public, anon, authenticated;
revoke all on function private.set_updated_at() from public, anon, authenticated;
revoke all on function private.touch_conversation_after_message() from public, anon, authenticated;
revoke all on function private.create_profile_for_new_user() from public, anon, authenticated;

commit;
