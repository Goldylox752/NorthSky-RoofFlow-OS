"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Buy Leads", href: "/buy" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "Admin", href: "/admin" },
  ];

  return (
    <html lang="en">
      <body style={styles.body}>
        {/* ================= NAVBAR ================= */}
        <header style={styles.navbar}>
          <div style={styles.logo}>RoofFlow OS</div>

          <nav style={styles.nav}>
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/" && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    ...styles.link,
                    opacity: isActive ? 1 : 0.65,
                    borderBottom: isActive
                      ? "2px solid #4da3ff"
                      : "2px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {/* ================= PAGE CONTENT ================= */}
        <main style={styles.main}>{children}</main>
      </body>
    </html>
  );
}

/* ================= STYLES ================= */
const styles = {
  body: {
    margin: 0,
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    background: "#0b1220",
    color: "#ffffff",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 24px",
    borderBottom: "1px solid #1f2937",
    position: "sticky",
    top: 0,
    background: "rgba(11, 18, 32, 0.9)",
    backdropFilter: "blur(10px)",
    zIndex: 100,
  },

  logo: {
    fontWeight: 700,
    fontSize: "18px",
    color: "#4da3ff",
    letterSpacing: "0.5px",
  },

  nav: {
    display: "flex",
    gap: "18px",
    alignItems: "center",
  },

  link: {
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "14px",
    paddingBottom: "4px",
    transition: "all 0.2s ease",
    borderBottom: "2px solid transparent",
  },

  main: {
    minHeight: "100vh",
  },
};