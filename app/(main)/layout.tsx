import { BottomNav } from "@/components/navigation/BottomNav"
import { AuthProvider } from "@/components/auth/AuthProvider"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      {children}
      <BottomNav />
    </AuthProvider>
  )
}
