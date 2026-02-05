import Link from "next/link";
import LogoutButton from "./logOutButton";

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: "Data Pasien", href: "/dashboard/pasien" },
  { label: "Data Reservasi", href: "/dashboard/reservasi" },
];

export default function SideNav() {
  return (
    <aside className="h-screen w-72 border-r border-white/10 bg-slate-950/40 p-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4">
        <div className="text-sm font-semibold text-slate-100">
          Reservasi Dokter Gigi
        </div>
        <div className="mt-1 text-xs text-slate-400">Dashboard</div>
      </div>

      <nav className="mt-4" aria-label="Sisi navigasi dashboard">
        <div className="px-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Menu
        </div>

        <ul className="mt-2 space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="block rounded-xl border border-transparent px-3 py-2 text-sm text-slate-200 hover:border-white/10 hover:bg-white/5"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="flex mx-auto mt-20">
        <LogoutButton/>
      </div>
      
    </aside>
  );
}
