import { AuthProvider } from "@/components/auth/AuthProvider"

export default function RestaurantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AuthProvider>{children}</AuthProvider>
}
