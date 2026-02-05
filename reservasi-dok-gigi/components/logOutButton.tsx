// components/LogoutButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  className?: string;
};

export default function LogoutButton({ className = "" }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch(`${process.env.BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include", // important for cookies
        headers: { "content-type": "application/json" },
      });
    } finally {
      setLoading(false);
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={[
        "rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100",
        "hover:bg-white/10 disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      {loading ? "Logging out..." : "Logout"}
    </button>
  );
}
