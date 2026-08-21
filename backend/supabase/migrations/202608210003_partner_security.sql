begin;

alter table public.profiles enable row level security;
alter table public.conversations enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.match_queue enable row level security;
alter table public.messages enable row level security;
alter table public.corrections enable row level security;
alter table public.user_blocks enable row level security;
alter table public.reports enable row level security;
alter table public.user_presence enable row level security;

alter table public.profiles force row level security;
alter table public.conversations force row level security;
alter table public.conversation_participants force row level security;
alter table public.match_queue force row level security;
alter table public.messages force row level security;
alter table public.corrections force row level security;
alter table public.user_blocks force row level security;
alter table public.reports force row level security;
alter table public.user_presence force row level security;

revoke all on public.profiles from anon, authenticated;
revoke all on public.conversations from anon, authenticated;
revoke all on public.conversation_participants from anon, authenticated;
revoke all on public.match_queue from anon, authenticated;
revoke all on public.messages from anon, authenticated;
revoke all on public.corrections from anon, authenticated;
revoke all on public.user_blocks from anon, authenticated;
revoke all on public.reports from anon, authenticated;
revoke all on public.user_presence from anon, authenticated;
revoke all on private.rate_buckets from public, anon, authenticated;

grant select (
  id,
  display_name,
  avatar_path,
  native_language,
  learning_language,
  proficiency
) on public.profiles to authenticated;
grant update (
  display_name,
  avatar_path,
  native_language,
  learning_language,
  proficiency,
  onboarding_complete,
  is_adult
) on public.profiles to authenticated;
grant select on public.conversations to authenticated;
grant select on public.conversation_participants to authenticated;
grant select on public.match_queue to authenticated;
grant select on public.messages to authenticated;
grant select on public.corrections to authenticated;
grant select on public.user_blocks to authenticated;
grant select on public.reports to authenticated;
grant update (state, resolution_note, resolved_at) on public.reports to authenticated;
grant select on public.user_presence to authenticated;

grant usage on schema private to authenticated;
grant execute on function private.is_conversation_member(uuid, uuid) to authenticated;
grant execute on function private.is_active_conversation_member(uuid, uuid) to authenticated;
grant execute on function private.shares_conversation(uuid, uuid) to authenticated;
grant execute on function private.is_blocked_between(uuid, uuid) to authenticated;
grant execute on function private.is_blocked_in_conversation(uuid, uuid) to authenticated;
grant execute on function private.storage_conversation_id(text) to authenticated;
grant execute on function private.topic_conversation_id(text) to authenticated;

revoke all on function public.find_partner(uuid) from public, anon;
revoke all on function public.get_my_profile() from public, anon;
revoke all on function public.leave_match_queue() from public, anon;
revoke all on function public.heartbeat_presence(uuid, public.presence_state, uuid) from public, anon;
revoke all on function public.send_text_message(uuid, text, uuid, uuid) from public, anon;
revoke all on function public.prepare_voice_upload(uuid, text, integer, integer, uuid) from public, anon;
revoke all on function public.finalize_voice_message(
  uuid, text, text, integer, integer, uuid, text, public.language_code, uuid
) from public, anon;
revoke all on function public.submit_correction(uuid, text, text, uuid) from public, anon;
revoke all on function public.mark_conversation_read(uuid) from public, anon;
revoke all on function public.block_user(uuid, text) from public, anon;
revoke all on function public.unblock_user(uuid) from public, anon;
revoke all on function public.submit_report(
  uuid, public.report_reason, text, uuid, uuid, boolean
) from public, anon;
revoke all on function public.close_conversation(uuid) from public, anon;

grant execute on function public.find_partner(uuid) to authenticated;
grant execute on function public.get_my_profile() to authenticated;
grant execute on function public.leave_match_queue() to authenticated;
grant execute on function public.heartbeat_presence(uuid, public.presence_state, uuid) to authenticated;
grant execute on function public.send_text_message(uuid, text, uuid, uuid) to authenticated;
grant execute on function public.prepare_voice_upload(uuid, text, integer, integer, uuid) to authenticated;
grant execute on function public.finalize_voice_message(
  uuid, text, text, integer, integer, uuid, text, public.language_code, uuid
) to authenticated;
grant execute on function public.submit_correction(uuid, text, text, uuid) to authenticated;
grant execute on function public.mark_conversation_read(uuid) to authenticated;
grant execute on function public.block_user(uuid, text) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
grant execute on function public.submit_report(
  uuid, public.report_reason, text, uuid, uuid, boolean
) to authenticated;
grant execute on function public.close_conversation(uuid) to authenticated;

create policy profiles_select_safe_peers
on public.profiles
for select
to authenticated
using (
  id = auth.uid()
  or private.shares_conversation(auth.uid(), id)
);

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy conversations_select_members
on public.conversations
for select
to authenticated
using (private.is_conversation_member(id, auth.uid()));

create policy participants_select_conversation_members
on public.conversation_participants
for select
to authenticated
using (private.is_conversation_member(conversation_id, auth.uid()));

create policy queue_select_self
on public.match_queue
for select
to authenticated
using (user_id = auth.uid());

create policy messages_select_members
on public.messages
for select
to authenticated
using (private.is_conversation_member(conversation_id, auth.uid()));

create policy corrections_select_members
on public.corrections
for select
to authenticated
using (
  exists (
    select 1
    from public.messages m
    where m.id = source_message_id
      and private.is_conversation_member(m.conversation_id, auth.uid())
  )
);

create policy blocks_select_self
on public.user_blocks
for select
to authenticated
using (blocker_id = auth.uid());

create policy reports_select_own_or_moderator
on public.reports
for select
to authenticated
using (
  reporter_id = auth.uid()
  or coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'moderator'
);

create policy reports_update_moderator
on public.reports
for update
to authenticated
using (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'moderator')
with check (coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'moderator');

create policy presence_select_self_or_active_partner
on public.user_presence
for select
to authenticated
using (
  user_id = auth.uid()
  or (
    state <> 'offline'
    and heartbeat_at > now() - interval '90 seconds'
    and conversation_id is not null
    and private.is_active_conversation_member(conversation_id, auth.uid())
  )
);

drop policy if exists huilaishi_voice_read_members on storage.objects;
create policy huilaishi_voice_read_members
on storage.objects
for select
to authenticated
using (
  bucket_id = 'voice-messages'
  and private.storage_conversation_id(name) is not null
  and private.is_conversation_member(private.storage_conversation_id(name), auth.uid())
);

-- There is deliberately no authenticated INSERT/UPDATE/DELETE policy for the
-- private voice bucket. Uploads are possible only through a short-lived signed
-- upload ticket minted by the voice-upload-ticket Edge Function.

do $$
declare
  v_table text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach v_table in array array[
      'conversations',
      'conversation_participants',
      'match_queue',
      'messages',
      'corrections',
      'user_presence'
    ] loop
      begin
        execute format('alter publication supabase_realtime add table public.%I', v_table);
      exception when duplicate_object then
        null;
      end;
    end loop;
  end if;
end;
$$;

do $$
begin
  if to_regclass('realtime.messages') is not null then
    execute 'alter table realtime.messages enable row level security';
    execute 'drop policy if exists huilaishi_private_channel_read on realtime.messages';
    execute 'drop policy if exists huilaishi_private_channel_write on realtime.messages';
    execute $policy$
      create policy huilaishi_private_channel_read
      on realtime.messages
      for select
      to authenticated
      using (
        private.topic_conversation_id(realtime.topic()) is not null
        and private.is_active_conversation_member(
          private.topic_conversation_id(realtime.topic()),
          auth.uid()
        )
      )
    $policy$;
    execute $policy$
      create policy huilaishi_private_channel_write
      on realtime.messages
      for insert
      to authenticated
      with check (
        extension in ('broadcast', 'presence')
        and private.topic_conversation_id(realtime.topic()) is not null
        and private.is_active_conversation_member(
          private.topic_conversation_id(realtime.topic()),
          auth.uid()
        )
      )
    $policy$;
  end if;
end;
$$;

create or replace function private.cleanup_partner_ephemera()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.match_queue
  set state = 'expired',
      matched_conversation_id = null,
      expires_at = now()
  where state = 'waiting'
    and expires_at < now();

  update public.user_presence
  set state = 'offline',
      conversation_id = null,
      updated_at = now()
  where state <> 'offline'
    and heartbeat_at < now() - interval '90 seconds';

  delete from private.rate_buckets
  where window_started_at < now() - interval '2 days';
end;
$$;

revoke all on function private.cleanup_partner_ephemera() from public, anon, authenticated;

comment on function private.cleanup_partner_ephemera() is
  'Invoke every minute with pg_cron or an external scheduler; service role only.';

commit;
