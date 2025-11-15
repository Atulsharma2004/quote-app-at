"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, X } from "lucide-react"

export default function SelectPlan() {
  const router = useRouter()

  const handlePlanSelect = async (plan) => {
    if (plan === "free") {
      router.push("/auth/signin?message=You have selected the Free Plan. Please sign in to continue.")
    } else {
      try {
        const res = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan }),
        })

        const data = await res.json()
        if (data?.url) {
          router.push(data.url)
        } else {
          alert("Payment initialization failed. Please try again.")
          console.error("Stripe Error:", data.error)
        }
      } catch (error) {
        console.error("Fetch failed:", error)
        alert("Something went wrong.")
      }
    }
  }

  const plans = [
    {
      title: "Free Plan",
      price: "Free",
      planKey: "free",
      features: [
        { name: "Access to basic features", included: true },
        { name: "Access to Restricted Quotes", included: true },
        { name: "Create Quotes", included: false },
        { name: "Priority support", included: false },
        { name: "Custom themes", included: false },
      ],
    },
    {
      title: "Basic Plan",
      price: "₹349/month",
      planKey: "basic",
      features: [
        { name: "Access to basic features", included: true },
        { name: "Access to Limited+ Quotes", included: true },
        { name: "Create Limited Quotes", included: true },
        { name: "Priority support", included: false },
        { name: "Custom themes", included: false },
      ],
    },
    {
      title: "Premium Plan",
      price: "₹499/month",
      planKey: "premium",
      features: [
        { name: "Access to basic features", included: true },
        { name: "Access to All Quotes", included: true },
        { name: "Create Infinite Quotes", included: true },
        { name: "Priority support", included: true },
        { name: "Custom themes", included: true },
      ],
    },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-100 p-4">
      <div className="text-center space-y-8">
        <h1 className="text-3xl font-bold">Select a plan that suits your needs:</h1>
        <div className="flex flex-col md:flex-row gap-6 justify-center">
          {plans.map((plan) => (
            <div
              key={plan.planKey}
              className="border border-gray-300 rounded-2xl p-6 bg-white shadow-md w-full md:w-80 hover:shadow-xl transition"
            >
              <h2 className="text-xl font-semibold mb-2">{plan.title}</h2>
              <p className="text-lg text-blue-600 font-bold mb-4">{plan.price}</p>
              <ul className="text-left space-y-2 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="text-green-500 w-4 h-4" />
                    ) : (
                      <X className="text-red-500 w-4 h-4" />
                    )}
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>
              <Button
                className="w-full"
                onClick={() => handlePlanSelect(plan.planKey)}
              >
                {plan.price === "Free" ? "Get Started" : `Choose ${plan.price}`}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
