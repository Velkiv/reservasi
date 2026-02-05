import type { ReactNode } from "react";
import SideNav from "@/components/sideNav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-gray-900 text-slate-100">
      <div className="flex">
        <SideNav />

        <main className="min-h-screen flex-1 p-6">
          <div className="mx-auto w-full max-w-5xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
