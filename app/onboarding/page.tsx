"use client"

import { useState } from "react"
import { WelcomeScreen } from "@/components/onboarding/WelcomeScreen"
import { LocationPrompt } from "@/components/onboarding/LocationPrompt"

export default function OnboardingPage() {
  const [step, setStep] = useState<"welcome" | "location">("welcome")

  if (step === "welcome") {
    return <WelcomeScreen onContinue={() => setStep("location")} />
  }

  return <LocationPrompt />
}
