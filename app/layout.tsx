import type { Metadata, Viewport } from "next"
import { Geist, Instrument_Serif, JetBrains_Mono } from "next/font/google"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
})

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
})

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Guess How Much — A Brisbane cheap eats guide",
  description:
    "A community-kept guide to genuinely cheap takeaway in Brisbane. Everything under $15, verified on the ground.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Guess How Much",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#faf7f0",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geist.variable} ${instrument.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="flex min-h-full flex-col bg-paper font-sans text-ink">
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                })
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
