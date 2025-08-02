import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Math Fun Games - Learn Math Through Play!",
  description: "Educational math games for children aged 5-10. Learn addition, subtraction, multiplication, and division through fun interactive games!",
  keywords: "math games, children education, arithmetic, learning games, kids math",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="min-h-screen">
          {children}
        </div>
      </body>
    </html>
  )
}
