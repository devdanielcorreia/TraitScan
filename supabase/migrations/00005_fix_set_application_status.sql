-- Fix ambiguity in set_application_status parameters vs columns
drop function if exists set_application_status(text, assessment_status, timestamptz, timestamptz);
create or replace function set_application_status(
  app_token text,
  new_status assessment_status,
  new_started_at timestamptz default null,
  new_completed_at timestamptz default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update assessment_applications
  set
    status = new_status,
    started_at = coalesce(new_started_at, started_at),
    completed_at = coalesce(new_completed_at, completed_at)
  where unique_token = app_token;
end;
$$;

grant execute on function set_application_status(text, assessment_status, timestamptz, timestamptz) to anon;
