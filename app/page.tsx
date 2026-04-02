'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, ShieldCheck, Smartphone, Zap } from 'lucide-react';

export default function Home() {
  const features = [
    {
      icon: <Smartphone className="w-6 h-6 text-emerald-600" />,
      title: 'Kontrol Jarak Jauh',
      description: 'Pantau dan kendalikan pompa air kebun Anda dari mana saja melalui smartphone atau PC.',
    },
    {
      icon: <Zap className="w-6 h-6 text-emerald-600" />,
      title: 'Real-time Monitoring',
      description: 'Dapatkan data suhu dan kelembaban tanah secara instan tanpa delay yang berarti.',
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
      title: 'Keamanan Otomatis',
      description: 'Sistem otomatis menyalakan pompa jika suhu terlalu panas untuk mencegah tanaman layu.',
    },
    {
      icon: <Leaf className="w-6 h-6 text-emerald-600" />,
      title: 'Ramah Lingkungan',
      description: 'Optimalkan penggunaan air dengan menyiram hanya saat tanaman benar-benar membutuhkannya.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/garden/1920/1080?blur=10')] bg-cover bg-center opacity-5"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold mb-6 border border-emerald-200">
                Sistem Pertanian Pintar Masa Depan
              </span>
              <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-8 leading-tight">
                Rawat Kebun Anda dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Teknologi Cerdas</span>
              </h1>
              <p className="text-xl text-slate-600 mb-10 leading-relaxed">
                Platform IoT terintegrasi untuk memantau suhu, kelembaban tanah, dan mengontrol penyiraman secara otomatis. Tingkatkan hasil panen dengan presisi.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-full shadow-lg shadow-emerald-600/30 transition-all hover:-translate-y-1"
                >
                  Connect Your Device
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <Link 
                  href="/about" 
                  className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 rounded-full shadow-sm transition-all"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Fitur Unggulan Kami</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              SmartGarden dirancang untuk memberikan kemudahan maksimal dalam merawat tanaman Anda dengan berbagai fitur canggih.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/leaves/1920/1080')] bg-cover bg-center opacity-10 mix-blend-overlay"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Siap untuk mendigitalkan kebun Anda?</h2>
          <p className="text-emerald-100 text-lg mb-10">
            Bergabunglah dengan ratusan petani modern lainnya yang telah beralih ke SmartGarden.
          </p>
          <Link 
            href="/register" 
            className="inline-flex items-center justify-center px-8 py-4 text-base font-bold text-emerald-900 bg-white hover:bg-emerald-50 rounded-full shadow-xl transition-all hover:scale-105"
          >
            Daftar Sekarang Gratis
          </Link>
        </div>
      </section>
      
      {/* Simple Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500">
          <p>&copy; {new Date().getFullYear()} SmartGarden. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
