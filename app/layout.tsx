import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'LST Poultry Farm',
  description: 'Poultry farm management system',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F4F2ED] font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
