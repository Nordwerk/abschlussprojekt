'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const isKonfiguratorRoute = pathname?.startsWith('/konfigurator');

  const scrollTo = (id: string) => {
    if (pathname !== '/') {
      router.push(`/#${id}`);
    } else {
      const element = document.getElementById(id);
      if (element) {
        const offset = 130;
        const top = element.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
    setMenuOpen(false);
  };

  const goHome = () => {
    if (pathname !== '/') {
      router.push('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setMenuOpen(false);
  };

  const goToKonfigurator = () => {
    if (pathname === '/konfigurator') {
      window.dispatchEvent(new CustomEvent('konfigurator:show-selection'));
      window.location.hash = 'auswahl';
    } else {
      router.push('/konfigurator#auswahl');
    }
    setMenuOpen(false);
  };

  return (
    <nav className={`${isKonfiguratorRoute ? 'relative' : 'fixed top-0 left-0'} w-full z-50 bg-black/10 backdrop-blur-[2px] border-b border-white/5`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
        
        <button onClick={goHome} className="cursor-pointer">
          <Image
            src="/logo.png"
            alt="Nordwerk Workwear Logo"
            width={220}
            height={75}
            className="w-[150px] sm:w-[180px] md:w-[220px] h-auto"
            priority
          />
        </button>

        {/* Hamburger Button */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menü öffnen"
        >
          <span className={`block w-6 h-0.5 bg-nordwerk-orange transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-6 h-0.5 bg-nordwerk-orange transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-0.5 bg-nordwerk-orange transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-10 text-nordwerk-orange font-medium tracking-wide items-center">
          <button onClick={() => scrollTo('ueber-uns')} className="hover:text-white transition duration-300 cursor-pointer">
            Über uns
          </button>
          <button onClick={() => scrollTo('produktion')} className="hover:text-white transition duration-300 cursor-pointer">
            Leistungen
          </button>
          <button onClick={() => scrollTo('veredelung')} className="hover:text-white transition duration-300 cursor-pointer">
            Veredelung
          </button>
          <button onClick={goToKonfigurator} className="hover:text-white transition duration-300 cursor-pointer">
            Konfigurator
          </button>
          <button onClick={() => scrollTo('kontakt')} className="border-2 border-nordwerk-orange bg-nordwerk-orange text-black px-5 py-2 rounded-md hover:bg-transparent hover:text-white hover:border-white hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer">
            Anfrage
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col items-center gap-5 py-6 bg-black/90 backdrop-blur-md text-nordwerk-orange font-medium">
          <button onClick={() => scrollTo('ueber-uns')} className="hover:text-white transition duration-300 cursor-pointer">
            Über uns
          </button>
          <button onClick={() => scrollTo('produktion')} className="hover:text-white transition duration-300 cursor-pointer">
            Leistungen
          </button>
          <button onClick={() => scrollTo('veredelung')} className="hover:text-white transition duration-300 cursor-pointer">
            Veredelung
          </button>
          <button onClick={goToKonfigurator} className="hover:text-white transition duration-300 cursor-pointer">
            Konfigurator
          </button>
          <button onClick={() => scrollTo('kontakt')} className="border-2 border-nordwerk-orange bg-nordwerk-orange text-black px-5 py-2 rounded-md hover:bg-transparent hover:text-white hover:border-white transition-all duration-300 cursor-pointer">
            Anfrage
          </button>
        </div>
      </div>
    </nav>
  );
}