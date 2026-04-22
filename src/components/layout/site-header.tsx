import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/", label: "Accueil" },
  { href: "/upload", label: "Import" },
  { href: "/dashboard", label: "Tableau de bord" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <Link href="/" className="text-lg font-bold tracking-tight text-slate-900">
            {APP_NAME}
          </Link>
          <p className="text-xs text-slate-500">
            Stocks, ventes et recommandations claires pour petits marchands.
          </p>
        </div>

        <nav className="flex items-center gap-2 sm:gap-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
