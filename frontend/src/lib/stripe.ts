import Stripe from "stripe";
import { loadStripe, Stripe as ClientStripe } from "@stripe/stripe-js";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock_secret_key", {
  apiVersion: "2025-02-02-preview" as unknown as never,
});

let stripePromise: Promise<ClientStripe | null>;

export const getStripe = () => {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");
  }
  return stripePromise;
};
