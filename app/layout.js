import Script from "next/script";
import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://yourdomain.com"),

  title: {
    default: "RoofFlow | Exclusive Roofing Leads & Booked Appointments",
    template: "%s | RoofFlow",
  },

  description:
    "RoofFlow delivers exclusive, high-intent roofing leads directly to contractors. Stop cold calls and shared lists — get booked appointments from homeowners actively requesting roofing estimates.",

  keywords: [
    "roofing leads",
    "exclusive roofing leads",
    "roofing appointment booking",
    "roofing lead generation system",
    "contractor lead service",
    "roofing marketing automation",
    "booked roofing appointments",
  ],

  authors: [{ name: "RoofFlow" }],

  creator: "RoofFlow",

  openGraph: {
    title: "RoofFlow | Exclusive Roofing Leads & Booked Appointments",
    description:
      "Get pre-qualified homeowners requesting roofing estimates delivered directly to your pipeline.",
    url: "https://yourdomain.com",
    siteName: "RoofFlow",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "RoofFlow | Roofing Leads That Actually Convert",
    description:
      "Exclusive roofing leads and booked appointments delivered automatically.",
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://yourdomain.com",
  },
};