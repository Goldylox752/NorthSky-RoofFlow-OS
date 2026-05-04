"use client";

import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LeadForm({ city }) {
  const [phone, setPhone] = useState("");

  const submit = async () => {
    await fetch(`${API_URL}/api/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone,
        city,
        score: 7,
        cityTier: "basic",
      }),
    });

    alert("Lead submitted");
  };

  return (
    <div>
      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={styles.input}
      />

      <button onClick={submit} style={styles.button}>
        Submit Lead
      </button>
    </div>
  );
}

const styles = {
  input: {
    padding: 12,
    width: "100%",
    marginBottom: 10,
  },
  button: {
    padding: 12,
    width: "100%",
    background: "#4da3ff",
    color: "white",
    border: "none",
    cursor: "pointer",
  },
};