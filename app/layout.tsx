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
  title: "Code Four Recap",
  description: "Your trial period, recapped. See the impact Code Four made for your department.",
  icons: {
    icon: '/codefour/branding/favicon.png',
  },
  openGraph: {
    title: "Code Four Recap",
    description: "Your trial period, recapped. See the impact Code Four made for your department.",
    images: [
      {
        url: '/codefour/branding/code-four-link-preview.png',
        width: 1200,
        height: 630,
        alt: 'Code Four Recap - Your Trial Period Results',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Code Four Recap",
    description: "Your trial period, recapped. See the impact Code Four made for your department.",
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
