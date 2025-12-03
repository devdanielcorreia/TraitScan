-- Public RPC to fetch assessment content by application token
create or replace function get_assessment_content(app_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  result jsonb;
begin
  select jsonb_build_object(
    'application_id', aa.id,
    'assessment_id', a.id,
    'assessment_name', a.name,
    'assessment_description', a.description,
    'status', aa.status,
    'expires_at', aa.expires_at,
    'quizzes', (
      select jsonb_agg(
        jsonb_build_object(
          'order_number', aq.order_number,
          'quiz_id', q.id,
          'name', q.name,
          'description', q.description,
          'questions', (
            select jsonb_agg(
              jsonb_build_object(
                'id', qs.id,
                'question_text', qs.question_text,
                'order_number', qs.order_number,
                'alternatives', (
                  select jsonb_agg(
                    jsonb_build_object(
                      'id', al.id,
                      'alternative_text', al.alternative_text,
                      'order_number', al.order_number,
                      'weight', al.weight
                    )
                    order by al.order_number
                  )
                  from alternatives al
                  where al.question_id = qs.id
                )
              )
              order by qs.order_number
            )
            from questions qs
            where qs.quiz_id = q.id
          )
        )
        order by aq.order_number
      )
      from assessment_quizzes aq
      join quizzes q on q.id = aq.quiz_id
      where aq.assessment_id = a.id
    )
  )
  into result
  from assessment_applications aa
  join assessments a on a.id = aa.assessment_id
  where aa.unique_token = app_token
    and (aa.expires_at is null or aa.expires_at > now());

  return result;
end;
$$;

grant execute on function get_assessment_content(text) to anon;

-- Public RPC to update application status by token (used in public assessment flow)
create or replace function set_application_status(
  app_token text,
  new_status assessment_status,
  started_at timestamptz default null,
  completed_at timestamptz default null
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
    started_at = coalesce(started_at, set_application_status.started_at),
    completed_at = coalesce(completed_at, set_application_status.completed_at)
  where unique_token = app_token;
end;
$$;

grant execute on function set_application_status(text, assessment_status, timestamptz, timestamptz) to anon;
