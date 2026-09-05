import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import "./globals.css"

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || ""

export const metadata: Metadata = {
  title: "MaroHub - Linux Games Collection",
  description: "Explore ready-to-run Linux games with magnet download links, no ads and no accounts.",
  icons: {
    icon: [
      {
        url: `${BASE_PATH}/icon-light-32x32.png`,
        media: "(prefers-color-scheme: light)",
      },
      {
        url: `${BASE_PATH}/icon-dark-32x32.png`,
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: `${BASE_PATH}/icon.svg`,
        type: "image/svg+xml",
      },
    ],
    apple: `${BASE_PATH}/apple-icon.png`,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geist.variable} ${geistMono.variable} font-sans antialiased pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-0`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content">{children}</main>
        <Footer />
      </body>
    </html>
  )
}