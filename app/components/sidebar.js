"use client";

import Link from "next/link";

export default function Sidebar({ role = "guest" }) {
  return (
    <aside style={styles.sidebar}>
      <h2 style={styles.logo}>RoofFlow OS</h2>

      <nav style={styles.nav}>
        <Link href="/">Home</Link>
        <Link href="/marketplace">Marketplace</Link>

        {role === "admin" && (
          <>
            <Link href="/admin">Admin Dashboard</Link>
            <Link href="/admin/cities">Cities</Link>
            <Link href="/admin/revenue">Revenue</Link>
          </>
        )}

        {role === "contractor" && (
          <>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/leads">My Leads</Link>
            <Link href="/billing">Billing</Link>
          </>
        )}
      </nav>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 220,
    minHeight: "100vh",
    background: "#0f172a",
    padding: 20,
    color: "white",
  },
  logo: {
    marginBottom: 20,
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
};