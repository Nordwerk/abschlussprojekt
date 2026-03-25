import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nordwerk Workwear – Arbeitskleidung mit System",
  description: "Arbeitskleidung für Handwerk & Industrie. Beratung, Ausstattung und Veredelung aus einer Hand. Professionell, normgerecht, langlebig.",
  keywords: ["Arbeitskleidung", "Workwear", "Berufsbekleidung", "Textildruck", "Stick", "Veredelung", "Handwerk", "Industrie", "Nordwerk"],
  openGraph: {
    title: "Nordwerk Workwear – Arbeitskleidung mit System",
    description: "Arbeitskleidung für Handwerk & Industrie. Beratung, Ausstattung und Veredelung aus einer Hand.",
    type: "website",
    locale: "de_DE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
