import type { Metadata } from "next";
import Script from "next/script";
import GoogleAnalytics from "../components/GoogleAnalytics";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Nini Pijamas - Boutique nocturna",
    template: "%s | Nini Pijamas"
  },
  description: "Pijamas femeninas boutique, suaves y comodas para descansar con estilo.",
  keywords: ["pijamas femeninas", "boutique de pijamas", "pijamas suaves", "ropa de dormir", "Nini Pijamas"],
  authors: [{ name: "Nini Pijamas" }],
  creator: "Nini Pijamas",
  publisher: "Nini Pijamas",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "es_EC",
    url: "/",
    siteName: "Nini Pijamas",
    title: "Nini Pijamas - Boutique nocturna",
    description: "Pijamas femeninas boutique, suaves y comodas para descansar con estilo.",
    images: [
      {
        url: "/nini-pijamas-logo.png",
        width: 512,
        height: 512,
        alt: "Logo de Nini Pijamas"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Nini Pijamas - Boutique nocturna",
    description: "Pijamas femeninas boutique, suaves y comodas para descansar con estilo.",
    images: ["/nini-pijamas-logo.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  icons: {
    icon: "/nini-pijamas-logo.png",
    shortcut: "/nini-pijamas-logo.png",
    apple: "/nini-pijamas-logo.png"
  }
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Nini Pijamas",
  url: siteUrl,
  logo: `${siteUrl}/nini-pijamas-logo.png`,
  description: "Boutique de pijamas femeninas suaves y comodas.",
  sameAs: []
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <a href="#contenido" className="skip-link">
          Saltar al contenido
        </a>
        <div id="contenido" tabIndex={-1}>
          {children}
        </div>
        <Script id="organization-json-ld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(organizationJsonLd)}
        </Script>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
