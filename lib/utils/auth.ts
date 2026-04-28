export function anonymizeEmail(email: string): string {
  const [local, domain] = email.split("@")
  if (!domain) return "***"
  const prefix = local.slice(0, 3)
  return `${prefix}***@${domain}`
}
