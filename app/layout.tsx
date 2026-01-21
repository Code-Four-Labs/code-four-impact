import type { Metadata } from "next";
import { Space_Grotesk } from 'next/font/google';
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "Code Four Impact",
  description: "Tomorrow's police tech delivered today.",
  icons: {
    icon: '/codefour/branding/favicon.png',
  },
  openGraph: {
    title: "Code Four Impact",
    description: "The AI Law Enforcement Copilot for a Better Tomorrow. Delivered Today.",
    images: [
      {
        url: '/codefour/branding/code-four-link-preview.png',
        width: 1200,
        height: 630,
        alt: 'Code Four Labs Corp.',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Code Four Impact",
    description: "The AI Law Enforcement Copilot for a Better Tomorrow. Delivered Today.",
    images: ['/codefour/branding/code-four-link-preview.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={spaceGrotesk.variable}>
      <body className={spaceGrotesk.className}>
        {children}
      </body>
    </html>
  );
}
