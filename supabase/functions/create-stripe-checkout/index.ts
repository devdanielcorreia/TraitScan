import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const priceId = Deno.env.get("STRIPE_PRICE_ID");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const appBaseUrl = Deno.env.get("APP_BASE_URL") ?? "https://trait-scan.vercel.app";
const defaultSuccessUrl = Deno.env.get("STRIPE_SUCCESS_URL") ?? `${appBaseUrl}/company/subscription?status=success`;
const defaultCancelUrl = Deno.env.get("STRIPE_CANCEL_URL") ?? `${appBaseUrl}/company/subscription?status=cancel`;

if (!stripeSecret || !priceId || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Stripe or Supabase configuration");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response("Unauthorized", { status: 401 });
  }

  const token = authHeader.replace("Bearer ", "");
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return new Response("Invalid session", { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || profile.role !== "company") {
    return new Response("Only company accounts can create checkout sessions", { status: 403 });
  }

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, stripe_customer_id")
    .eq("profile_id", profile.id)
    .maybeSingle();

  if (companyError || !company) {
    return new Response("Company not found", { status: 404 });
  }

  let body: { successUrl?: string; cancelUrl?: string } = {};
  try {
    body = await req.json();
  } catch (_) {
    // ignore malformed body, defaults will be used
  }

  const successUrl = body.successUrl ?? defaultSuccessUrl;
  const cancelUrl = body.cancelUrl ?? defaultCancelUrl;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: company.stripe_customer_id ?? undefined,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        company_id: company.id,
      },
      subscription_data: {
        metadata: {
          company_id: company.id,
        },
      },
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Stripe checkout error", error);
    return new Response("Failed to create checkout session", { status: 500 });
  }
});
