import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let payload: { token?: string; userId?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid payload", { status: 400 });
  }

  const { token, userId } = payload;
  if (!token || !userId) {
    return new Response("Missing token or userId", { status: 400 });
  }

  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (inviteError || !invitation) {
    return new Response("Invitation not found", { status: 404 });
  }

  if (invitation.status !== 'pending') {
    return new Response("Invitation already used", { status: 409 });
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return new Response("Invitation expired", { status: 410 });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: invitation.role })
    .eq('id', userId);

  if (profileError) {
    console.error(profileError);
    return new Response("Failed to update profile", { status: 500 });
  }

  const { error: updateInviteError } = await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateInviteError) {
    console.error(updateInviteError);
    return new Response("Failed to update invitation", { status: 500 });
  }

  return new Response(JSON.stringify({ success: true, role: invitation.role }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
