import type { Metadata } from 'next'
import Script from 'next/script'
import '../index.css'
import { AppProviders } from '../providers/AppProviders'

export const metadata: Metadata = {
  title: 'AI Assessment Creator',
  description: 'Create AI-assisted assignments and question papers.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="beforeInteractive"
        />

        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}