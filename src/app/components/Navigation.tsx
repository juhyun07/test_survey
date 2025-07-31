'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavigationProps {
  children?: React.ReactNode;
}

export default function Navigation({ children }: NavigationProps) {
  const [selectedPath, setSelectedPath] = useState<string>("/survey2");

  const navItems = [
    { path: "/survey2", label: "설문조사" },
    { path: "/survey/settings/new-style", label: "설문조사 설정" },
    { path: "/survey/settings/new-style-with-modal", label: "설문조사 설정 (with modal)" },
    { path: "/survey/test", label: "설문 테스트" },
    { path: "/survey/results", label: "설문 결과" }
  ];

  return (
    <nav className="nav-bg text-white p-4 fixed w-full top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-white">
          <Link href="/" className="hover:text-white/80">NPS</Link>
        </h1>
        <ul className="flex space-x-8">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`hover:text-white/80 ${selectedPath === item.path ? 'nav-selected' : ''}`}
                onClick={() => setSelectedPath(item.path)}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
