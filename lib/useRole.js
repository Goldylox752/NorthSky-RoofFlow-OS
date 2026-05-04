"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/auth";

export function useRole() {
  const [role, setRole] = useState(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.auth.getUser();

      const user = data?.user;
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setRole(profile?.role || "contractor");
    };

    load();
  }, []);

  return role;
}