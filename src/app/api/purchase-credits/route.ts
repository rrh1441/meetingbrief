import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth-server";
import { headers } from "next/headers";
import Stripe from "stripe";
import { Pool } from "pg";

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-05-28.basil",
}) : null;

const pool = process.env.DATABASE_URL ? new Pool({
  connectionString: process.env.DATABASE_URL,
}) : null;

export async function POST(request: NextRequest) {
  try {
    if (!stripe || !pool) {
      return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
    }

    const headersList = await headers();
    
    // Get session using Better Auth
    const session = await auth.api.getSession({
      headers: headersList,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { successUrl, cancelUrl } = await request.json();

    // Get user's Stripe customer ID from database
    const client = await pool.connect();
    let stripeCustomerId: string | null = null;
    
    try {
      const result = await client.query(
        'SELECT "stripeCustomerId" FROM "user" WHERE id = $1',
        [session.user.id]
      );
      
      if (result.rows.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }
      
      stripeCustomerId = result.rows[0].stripeCustomerId;
      
      if (!stripeCustomerId) {
        return NextResponse.json({ error: "No Stripe customer found. Please create a subscription first." }, { status: 400 });
      }
    } finally {
      client.release();
    }

    // Create one-time payment session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      mode: 'payment', // One-time payment, not subscription
      line_items: [
        {
          price: 'price_1Rls2RLAwHJFmbPEHIWlzIWO', // Add-on credits price
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      tax_id_collection: {
        enabled: true,
      },
      customer_update: {
        name: 'auto', // Allow Stripe to automatically update the customer's name
        address: 'auto', // Also allow address updates
      },
      metadata: {
        userId: session.user.id,
        type: 'credits_addon',
        credits: '50',
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: unknown) {
    console.error("Credits purchase error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create checkout session" },
      { status: 500 }
    );
  }
}