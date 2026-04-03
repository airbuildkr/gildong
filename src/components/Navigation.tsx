"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "피드" },
  { href: "/portfolio", label: "포트폴리오" },
  { href: "/about", label: "소개" },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="mt-12 pt-6 border-t border-gray-100 flex justify-center gap-8 text-sm text-gray-400">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`hover:text-gray-900 transition-colors ${
            pathname === link.href ? "text-gray-900 font-bold" : ""
          }`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
