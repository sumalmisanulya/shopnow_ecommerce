import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock_secret_key", {
  apiVersion: "2025-02-02-preview" as any,
});
