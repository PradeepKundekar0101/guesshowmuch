"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { siteUrl } from "@/lib/utils/site-url"
import type { User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  loading: boolean
  signInWithEmail: (email: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithEmail: async () => ({ error: null }),
  signOut: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  async function signInWithEmail(email: string) {
    // Remember where the user is so the callback can return them there
    const next =
      typeof window !== "undefined"
        ? `${window.location.pathname}${window.location.search}`
        : "/"
    const callback = siteUrl(`/api/auth/callback?next=${encodeURIComponent(next)}`)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callback,
      },
    })
    return { error: error?.message ?? null }
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}
