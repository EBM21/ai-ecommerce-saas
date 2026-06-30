import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://quadlix.com'),
  title: {
    default: "Quadlix - The AI-Powered E-commerce Platform | Shopify Alternative",
    template: "%s | Quadlix AI E-commerce",
  },
  description: "Create, manage, and scale your online store with Quadlix. The smartest AI-driven alternative to Shopify for modern ecommerce businesses. Launch in minutes.",
  keywords: [
    "ecommerce platform", "shopify alternative", "create online store", 
    "sell online", "ai ecommerce", "quadlix", "quadlify", "build ecommerce website",
    "online business", "dropshipping platform"
  ],
  authors: [{ name: "Quadlix Inc." }],
  creator: "Quadlix",
  publisher: "Quadlix",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://quadlix.com",
    siteName: "Quadlix",
    title: "Quadlix - Build Your AI-Powered Online Store",
    description: "The next generation AI ecommerce platform to build and scale your store. A smarter, faster alternative to Shopify.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Quadlix AI E-commerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Quadlix - The AI-Powered E-commerce Platform",
    description: "Launch your AI-driven ecommerce store in minutes. The ultimate Shopify alternative.",
    images: ["/og-image.jpg"],
    creator: "@quadlix",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
