import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const googleAnalyticsId = "G-9KQJMDZTE6";

export const metadata: Metadata = {
  title: {
    default: "DC Joinery | Kitchen Fitting & Bespoke Joinery Northern Ireland",
    template: "%s | DC Joinery",
  },
  description:
    "Professional kitchen fitting, kitchen supply and installation, fitted bedrooms, wardrobes and bespoke joinery across Northern Ireland.",
  keywords: [
    "DC Joinery",
    "Kitchen fitter Northern Ireland",
    "Kitchen fitting Craigavon",
    "Kitchen installation Belfast",
    "Kitchen fitter Belfast",
    "Wren kitchen fitter",
    "Howdens kitchen installer",
    "IKEA kitchen fitter",
    "B&Q kitchen fitting",
    "Fitted bedrooms Northern Ireland",
    "Bespoke joinery Northern Ireland",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DC Joinery | Kitchen Fitting Northern Ireland",
    description:
      "Kitchen fitting, supply and installation, fitted bedrooms and bespoke joinery across Northern Ireland.",
    url: "https://dcjoineryni.uk",
    siteName: "DC Joinery",
    images: [
      {
        url: "https://dcjoineryni.uk/projects/kitchen25.jpeg",
        width: 1200,
        height: 630,
        alt: "DC Joinery kitchen project",
      },
    ],
    locale: "en_GB",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
          strategy="afterInteractive"
        />

        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${googleAnalyticsId}');
          `}
        </Script>

        {children}
      </body>
    </html>
  );
}