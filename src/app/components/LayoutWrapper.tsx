'use client';

import { useEffect, useState } from 'react';
import Navigation from './Navigation';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isPopup, setIsPopup] = useState(false);

  useEffect(() => {
    const checkIsPopup = () => {
      const hash = window.location.hash;
      const params = new URLSearchParams(hash.split('?')[1] || '');
      setIsPopup(params.get('popup') === 'true');
    };

    checkIsPopup();

    window.addEventListener('hashchange', checkIsPopup);
    return () => window.removeEventListener('hashchange', checkIsPopup);
  }, []);

  return (
    <>
      {!isPopup && <Navigation />}
      <main className="container mx-auto p-8 flex-1 pt-16">
        {children}
      </main>
    </>
  );
}
