import Script from "next/script";

export const metadata = {
  title: {
    default: "RoofFlow | Qualified Roofing Appointments On Demand",
    template: "%s | RoofFlow",
  },
  description:
    "RoofFlow delivers high-intent homeowner roofing appointments directly into your pipeline. No cold leads. No wasted ad spend.",
  keywords: [
    "roofing leads",
    "roofing appointments",
    "exclusive contractor leads",
    "roofing marketing system",
    "roofing lead generation",
  ],
  openGraph: {
    title: "RoofFlow | Qualified Roofing Appointments",
    description:
      "Stop chasing leads. Get pre-qualified homeowners requesting roofing estimates delivered directly to you.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Google Tag Manager Script */}
        <Script id="gtm-script" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){
              w[l]=w[l]||[];
              w[l].push({'gtm.start': new Date().getTime(), event:'gtm.js'});
              var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),
              dl=l!='dataLayer'?'&l='+l:'';
              j.async=true;
              j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
              f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WQ67Z3XL');
          `}
        </Script>
      </head>

      <body style={styles.body}>
        {/* ✅ GTM Noscript Fallback */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WQ67Z3XL"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>

        {children}
      </body>
    </html>
  );
}

const styles = {
  body: {
    margin: 0,
    padding: 0,
    background: "#0b1220",
    color: "white",
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
  },
};
