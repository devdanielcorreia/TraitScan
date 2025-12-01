import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const allowedOrigins = (Deno.env.get("CORS_ALLOWED_ORIGINS") ?? "*")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Supabase environment variables");
}

const buildCorsHeaders = (origin: string | null) => {
  const allowAny = allowedOrigins.includes("*");
  const allowOrigin =
    allowAny || (origin && allowedOrigins.includes(origin))
      ? origin ?? "*"
      : allowedOrigins[0] ?? "*";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

const respond = (req: Request, body: BodyInit | null, init?: ResponseInit) => {
  const headers = {
    ...buildCorsHeaders(req.headers.get("origin")),
    ...init?.headers,
  };
  return new Response(body, { ...init, headers });
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return respond(req, null, { status: 204 });
  }

  if (req.method !== "POST") {
    return respond(req, "Method not allowed", { status: 405 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  let payload: { token?: string; userId?: string } = {};
  try {
    payload = await req.json();
  } catch {
    return respond(req, "Invalid payload", { status: 400 });
  }

  const { token, userId } = payload;
  if (!token || !userId) {
    return respond(req, "Missing token or userId", { status: 400 });
  }

  const { data: invitation, error: inviteError } = await supabase
    .from('invitations')
    .select('*')
    .eq('token', token)
    .maybeSingle();

  if (inviteError || !invitation) {
    return respond(req, "Invitation not found", { status: 404 });
  }

  if (invitation.status !== 'pending') {
    return respond(req, "Invitation already used", { status: 409 });
  }

  if (invitation.expires_at && new Date(invitation.expires_at) < new Date()) {
    return respond(req, "Invitation expired", { status: 410 });
  }

  if (invitation.role === 'psychologist') {
    const { error: ensurePsychologistError } = await supabase
      .from('psychologists')
      .upsert({
        id: userId,
        created_by: invitation.invited_by,
        is_active: true,
      }, { onConflict: 'id' });

    if (ensurePsychologistError) {
      console.error(ensurePsychologistError);
      return respond(req, "Failed to provision psychologist profile", { status: 500 });
    }
  }

  if (invitation.role === 'company') {
    const { data: profileData, error: profileLoadError } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', userId)
      .maybeSingle();

    if (profileLoadError) {
      console.error(profileLoadError);
      return respond(req, "Failed to load profile data", { status: 500 });
    }

    const fallbackPsychologist = invitation.psychologist_id ?? invitation.invited_by;
    const companyPayload: Record<string, unknown> = {
      profile_id: userId,
      name: invitation.invitee_name ?? profileData?.full_name ?? 'Nova empresa',
      email: invitation.email ?? profileData?.email ?? null,
      psychologist_id: fallbackPsychologist,
      is_active: true,
    };

    if (invitation.company_id) {
      const { error: updateCompanyError } = await supabase
        .from('companies')
        .update(companyPayload)
        .eq('id', invitation.company_id);

      if (updateCompanyError) {
        console.error(updateCompanyError);
        return respond(req, "Failed to update company", { status: 500 });
      }
    } else {
      const { error: insertCompanyError } = await supabase
        .from('companies')
        .insert(companyPayload);

      if (insertCompanyError) {
        console.error(insertCompanyError);
        return respond(req, "Failed to create company", { status: 500 });
      }
    }
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: invitation.role })
    .eq('id', userId);

  if (profileError) {
    console.error(profileError);
    return respond(req, "Failed to update profile", { status: 500 });
  }

  const { error: updateInviteError } = await supabase
    .from('invitations')
    .update({ status: 'accepted', accepted_at: new Date().toISOString() })
    .eq('id', invitation.id);

  if (updateInviteError) {
    console.error(updateInviteError);
    return respond(req, "Failed to update invitation", { status: 500 });
  }

  return respond(
    req,
    JSON.stringify({ success: true, role: invitation.role }),
    { headers: { "Content-Type": "application/json" } },
  );
});
