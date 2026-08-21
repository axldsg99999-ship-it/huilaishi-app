begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create type public.language_code as enum ('zh', 'th');
create type public.account_state as enum ('active', 'suspended', 'banned');
create type public.queue_state as enum ('waiting', 'matched', 'cancelled', 'expired');
create type public.conversation_state as enum ('active', 'closed');
create type public.message_kind as enum ('text', 'voice', 'system');
create type public.presence_state as enum ('online', 'away', 'offline');
create type public.report_reason as enum (
  'harassment',
  'hate_or_abuse',
  'sexual_content',
  'spam',
  'impersonation',
  'unsafe_off_platform_request',
  'other'
);
create type public.report_state as enum ('open', 'reviewing', 'resolved', 'dismissed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '学习者',
  avatar_path text,
  native_language public.language_code not null default 'zh',
  learning_language public.language_code not null default 'th',
  proficiency smallint not null default 1,
  onboarding_complete boolean not null default false,
  is_adult boolean not null default false,
  account_state public.account_state not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_language_exchange check (native_language <> learning_language),
  constraint profiles_name_length check (char_length(btrim(display_name)) between 1 and 32),
  constraint profiles_level_range check (proficiency between 1 and 6),
  constraint profiles_avatar_is_path check (
    avatar_path is null
    or (char_length(avatar_path) between 1 and 256 and avatar_path !~* '^[a-z][a-z0-9+.-]*://')
  )
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  state public.conversation_state not null default 'active',
  created_at timestamptz not null default now(),
  closed_at timestamptz,
  last_message_at timestamptz,
  constraint conversations_closed_at check (
    (state = 'active' and closed_at is null)
    or (state = 'closed' and closed_at is not null)
  )
);

create table public.conversation_participants (
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  left_at timestamptz,
  last_read_at timestamptz,
  primary key (conversation_id, user_id),
  constraint participants_left_after_joined check (left_at is null or left_at >= joined_at)
);

create table public.match_queue (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  native_language public.language_code not null,
  learning_language public.language_code not null,
  proficiency smallint not null,
  state public.queue_state not null default 'waiting',
  entered_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '90 seconds'),
  matched_conversation_id uuid references public.conversations (id) on delete set null,
  constraint queue_language_exchange check (native_language <> learning_language),
  constraint queue_level_range check (proficiency between 1 and 6),
  constraint queue_match_shape check (
    (state = 'matched' and matched_conversation_id is not null)
    or (state <> 'matched' and matched_conversation_id is null)
  )
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id) on delete set null,
  kind public.message_kind not null,
  text_content text,
  voice_object_path text,
  voice_mime_type text,
  voice_duration_ms integer,
  voice_size_bytes integer,
  transcript text,
  transcript_language public.language_code,
  reply_to_id uuid references public.messages (id) on delete set null,
  client_nonce uuid,
  created_at timestamptz not null default now(),
  edited_at timestamptz,
  constraint messages_payload_shape check (
    (
      kind = 'text'
      and sender_id is not null
      and text_content is not null
      and voice_object_path is null
      and voice_mime_type is null
      and voice_duration_ms is null
      and voice_size_bytes is null
      and transcript is null
      and transcript_language is null
    )
    or (
      kind = 'voice'
      and sender_id is not null
      and text_content is null
      and voice_object_path is not null
      and voice_mime_type is not null
      and voice_duration_ms is not null
      and voice_size_bytes is not null
    )
    or (
      kind = 'system'
      and sender_id is null
      and text_content is not null
      and voice_object_path is null
      and voice_mime_type is null
      and voice_duration_ms is null
      and voice_size_bytes is null
      and transcript is null
      and transcript_language is null
    )
  ),
  constraint messages_text_length check (
    text_content is null or char_length(btrim(text_content)) between 1 and 1000
  ),
  constraint messages_transcript_length check (
    transcript is null or char_length(btrim(transcript)) between 1 and 1000
  ),
  constraint messages_voice_path_length check (
    voice_object_path is null or char_length(voice_object_path) between 1 and 512
  ),
  constraint messages_voice_duration check (
    voice_duration_ms is null or voice_duration_ms between 250 and 120000
  ),
  constraint messages_voice_size check (
    voice_size_bytes is null or voice_size_bytes between 1 and 5242880
  )
);

create unique index messages_sender_nonce_unique
  on public.messages (sender_id, client_nonce)
  where client_nonce is not null;
create unique index messages_voice_object_unique
  on public.messages (voice_object_path)
  where voice_object_path is not null;

create table public.corrections (
  id uuid primary key default gen_random_uuid(),
  source_message_id uuid not null references public.messages (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  corrected_text text not null,
  note text,
  client_nonce uuid not null,
  created_at timestamptz not null default now(),
  constraint corrections_text_length check (char_length(btrim(corrected_text)) between 1 and 1000),
  constraint corrections_note_length check (note is null or char_length(btrim(note)) between 1 and 500),
  unique (author_id, client_nonce)
);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint blocks_not_self check (blocker_id <> blocked_id),
  constraint blocks_reason_length check (reason is null or char_length(btrim(reason)) between 1 and 300)
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid references public.conversations (id) on delete set null,
  message_id uuid references public.messages (id) on delete set null,
  reason public.report_reason not null,
  details text,
  state public.report_state not null default 'open',
  resolution_note text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz,
  constraint reports_not_self check (reporter_id <> reported_user_id),
  constraint reports_details_length check (details is null or char_length(btrim(details)) between 1 and 1000),
  constraint reports_resolution_length check (
    resolution_note is null or char_length(btrim(resolution_note)) between 1 and 1000
  ),
  constraint reports_resolution_shape check (
    (state in ('open', 'reviewing') and resolved_at is null)
    or (state in ('resolved', 'dismissed') and resolved_at is not null)
  )
);

create table public.user_presence (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  state public.presence_state not null default 'offline',
  conversation_id uuid references public.conversations (id) on delete set null,
  device_id uuid not null,
  heartbeat_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table private.rate_buckets (
  subject_id uuid not null,
  action text not null,
  window_started_at timestamptz not null,
  request_count integer not null default 1,
  primary key (subject_id, action, window_started_at),
  constraint rate_action_length check (char_length(action) between 1 and 64),
  constraint rate_count_positive check (request_count > 0)
);

create index participants_user_active_idx
  on public.conversation_participants (user_id, conversation_id)
  where left_at is null;
create index queue_waiting_match_idx
  on public.match_queue (native_language, learning_language, state, entered_at)
  where state = 'waiting';
create index messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);
create index corrections_message_created_idx
  on public.corrections (source_message_id, created_at);
create index reports_open_created_idx
  on public.reports (state, created_at)
  where state in ('open', 'reviewing');
create index presence_conversation_heartbeat_idx
  on public.user_presence (conversation_id, heartbeat_at desc)
  where state <> 'offline';
create index rate_buckets_cleanup_idx
  on private.rate_buckets (window_started_at);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

create or replace function private.touch_conversation_after_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.conversations
  set last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_touch_conversation
after insert on public.messages
for each row execute function private.touch_conversation_after_message();

create or replace function private.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_native public.language_code;
begin
  v_native := case
    when new.raw_user_meta_data ->> 'native_language' = 'th' then 'th'::public.language_code
    else 'zh'::public.language_code
  end;

  insert into public.profiles (
    id,
    display_name,
    native_language,
    learning_language
  ) values (
    new.id,
    left(coalesce(nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''), '学习者'), 32),
    v_native,
    case v_native
      when 'zh'::public.language_code then 'th'::public.language_code
      else 'zh'::public.language_code
    end
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger huilaishi_on_auth_user_created
after insert on auth.users
for each row execute function private.create_profile_for_new_user();

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'voice-messages',
  'voice-messages',
  false,
  5242880,
  array['audio/webm', 'audio/ogg', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/x-m4a']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

comment on table public.match_queue is
  'Ephemeral two-way language-exchange queue. A row is only considered online while last_seen_at and expires_at are fresh.';
comment on table public.messages is
  'Durable chat payloads. Clients cannot insert directly; use send_text_message or finalize_voice_message.';
comment on table public.user_presence is
  'Coarse durable heartbeat. Typing indicators use private Realtime broadcast channels and are never stored here.';
comment on table private.rate_buckets is
  'Server-side fixed-window counters. Never expose this schema through PostgREST.';

commit;
