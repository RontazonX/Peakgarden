'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { CheckCircle2 } from 'lucide-react';

export default function AboutPage() {
  const values = [
    'Inovasi Berkelanjutan',
    'Kemudahan Penggunaan',
    'Keandalan Sistem',
    'Dampak Lingkungan Positif'
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <div className="bg-emerald-900 py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/farm/1920/1080')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Tentang Kami
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-emerald-100 max-w-2xl mx-auto"
          >
            Misi kami adalah membawa teknologi cerdas ke setiap kebun dan lahan pertanian di Indonesia.
          </motion.p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Membangun Masa Depan Pertanian</h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              SmartGarden berawal dari sebuah ide sederhana: bagaimana kita bisa memanfaatkan teknologi Internet of Things (IoT) untuk membantu petani dan penghobi tanaman merawat kebun mereka dengan lebih efisien.
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Dengan menggabungkan sensor presisi tinggi dan antarmuka web yang mudah digunakan, kami menciptakan ekosistem di mana tanaman Anda selalu mendapatkan perawatan optimal, bahkan saat Anda berada jauh dari rumah.
            </p>
            
            <div className="space-y-4">
              {values.map((value, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  <span className="text-slate-700 font-medium">{value}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl"
          >
            <Image 
              src="https://picsum.photos/seed/greenhouse/800/1000" 
              alt="Greenhouse" 
              fill 
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
