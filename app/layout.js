import Script from "next/script";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "RoofFlow | Exclusive Roofing Leads & Booked Appointments",
    template: "%s | RoofFlow",
  },

  description:
    "Get exclusive roofing leads near you. RoofFlow delivers high-intent homeowners requesting roofing estimates directly into your pipeline — no cold leads or wasted ad spend.",

  keywords: [
    "roofing leads near me",
    "exclusive roofing leads",
    "roofing appointment service",
    "roofing lead generation",
    "contractor leads",
    "roofing marketing system",
  ],

  openGraph: {
    title: "Exclusive Roofing Leads & Appointments | RoofFlow",
    description:
      "Stop chasing leads. Get pre-qualified homeowners requesting roofing estimates in your area.",
    url: "https://yourdomain.com",
    siteName: "RoofFlow",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "RoofFlow | Roofing Leads & Appointments",
    description:
      "Exclusive roofing leads and booked appointments delivered on demand.",
  },

  alternates: {
    canonical: "https://yourdomain.com",
  },
};