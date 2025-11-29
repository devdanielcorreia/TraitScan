import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@15.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.3";

const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!stripeSecret || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
  throw new Error("Missing Stripe webhook configuration");
}

const stripe = new Stripe(stripeSecret, {
  apiVersion: "2024-06-20",
});

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const mapStatus = (stripeStatus?: string) => {
  switch (stripeStatus) {
    case "trialing":
      return "trial";
    case "active":
      return "active";
    case "past_due":
    case "incomplete":
    case "incomplete_expired":
      return "past_due";
    case "canceled":
      return "cancelled";
    default:
      return "inactive";
  }
};

const updateCompanySubscription = async (
  companyId: string,
  payload: { stripe_customer_id?: string | null; stripe_subscription_id?: string | null; subscription_status?: string; trial_ends_at?: string | null; is_active?: boolean }
) => {
  await supabase
    .from("companies")
    .update(payload)
    .eq("id", companyId);
};

const handleSubscriptionChange = async (subscription: Stripe.Subscription) => {
  const companyId = subscription.metadata?.company_id;
  if (!companyId) return;

  const status = mapStatus(subscription.status);
  const trialEnds = subscription.trial_end
    ? new Date(subscription.trial_end * 1000).toISOString()
    : null;

  await updateCompanySubscription(companyId, {
    stripe_customer_id: (subscription.customer as string) ?? null,
    stripe_subscription_id: subscription.id,
    subscription_status: status,
    trial_ends_at: trialEnds,
    is_active: status === "active" || status === "trial",
  });
};

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("Stripe-Signature");
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature ?? "", webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string,
        );
        await handleSubscriptionChange(subscription);
      }
    }

    if (
      event.type === "customer.subscription.updated" ||
      event.type === "customer.subscription.deleted"
    ) {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionChange(subscription);
    }
  } catch (error) {
    console.error("Error handling Stripe webhook", error);
    return new Response("Webhook handler error", { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
