import Stripe from "stripe"
import { NextResponse } from "next/server"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// const priceMap = {
//   basic: "price_1RfOi4SJnWBvOiKwhWlFSnsK",     // Replace with your actual test price ID
//   premium: "price_1RfOigSJnWBvOiKwFGBAFCIr",
// }

export async function POST(req) {
  try {
    const { plan } = await req.json()

    // const priceId = priceMap[plan]
    // if (!priceId) {
    //   return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    // }
    if (!["basic", "premium"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }


    // const session = await stripe.checkout.sessions.create({
    //   mode: "subscription", // ✅ this is the fix
    //   payment_method_types: ["card"],
    //   billing_address_collection: "auto",
    //   line_items: [{ price: priceId, quantity: 1 }],
    //   success_url: `${process.env.NEXTAUTH_URL}/auth/signin/login?message=Payment successful`,
    //   cancel_url: `${process.env.NEXTAUTH_URL}/select-plan`,
    // })

    const session = await stripe.checkout.sessions.create({
  mode: "payment", // ✅ changed from subscription
  payment_method_types: ["card"],
  line_items: [
    {
      price_data: {
        currency: "inr",
        product_data: {
          name: plan === "basic" ? "Basic Plan" : "Premium Plan",
        },
        unit_amount: plan === "basic" ? 34900 : 49900, // ✅ 349/499 INR in paise
      },
      quantity: 1,
    },
  ],
  success_url: `${process.env.NEXTAUTH_URL}/auth/signin?message=Payment successful`,
  cancel_url: `${process.env.NEXTAUTH_URL}/select-plan`,
})

    return NextResponse.json({ url: session.url })  // ✅ Valid JSON response
  } catch (error) {
    console.error("Stripe session error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })  // ✅ Valid JSON even in error
  }
}

