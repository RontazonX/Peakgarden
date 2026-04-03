'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Sprout, Menu, X, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (pathname.startsWith('/dashboard')) {
    return null;
  }

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/about' },
    ...(session ? [
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'Analitik', path: '/dashboard/analytics' },
      { name: 'Profil', path: '/profile' }
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              SmartGarden
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`text-sm font-medium transition-colors hover:text-emerald-600 ${
                    pathname === link.path ? 'text-emerald-600' : 'text-slate-600'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 transition-colors px-4 py-2 rounded-full"
                >
                  <LogOut className="w-4 h-4" />
                  Keluar
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-slate-600 hover:text-emerald-600 transition-colors px-4 py-2"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors px-5 py-2.5 rounded-full shadow-sm shadow-emerald-600/20"
                  >
                    Daftar
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-emerald-600 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-4 shadow-lg"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setIsOpen(false)}
                className={`text-base font-medium ${
                  pathname === link.path ? 'text-emerald-600' : 'text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-slate-100" />
            {session ? (
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="text-base font-medium text-red-600 text-left flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Keluar
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-slate-600"
                >
                  Masuk
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="text-base font-medium text-emerald-600"
                >
                  Daftar Sekarang
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
