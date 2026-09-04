import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AnalyticsConsent from "./components/AnalyticsConsent";
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
const siteUrl = "https://www.dcjoineryni.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "DC Joinery | Kitchen Fitting & Bespoke Kitchens Northern Ireland",
    template: "%s | DC Joinery",
  },
  description:
    "Professional kitchen fitting, kitchen supply and installation, fitted bedrooms, wardrobes and bespoke kitchens across Northern Ireland.",

  verification: {
    google: "hyUv2x_MicAMsMar7uTGKXwRzHZrC8NulgJylGxhiQo",
  },

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
    "Bespoke kitchens Northern Ireland",
  ],
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "DC Joinery | Kitchen Fitting Northern Ireland",
    description:
      "Kitchen fitting, supply and installation, fitted bedrooms and bespoke kitchens across Northern Ireland.",
    url: "https://www.dcjoineryni.uk",
    siteName: "DC Joinery",
    images: [
      {
        url: "https://www.dcjoineryni.uk/projects/kitchen51.jpeg",
        width: 1200,
        height: 630,
        alt: "DC Joinery finished kitchen project",
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
        <AnalyticsConsent googleAnalyticsId={googleAnalyticsId} />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}