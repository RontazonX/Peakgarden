'use client';

import { motion } from 'motion/react';
import Image from 'next/image';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';

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

      {/* Team Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Tim Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Orang di Balik SmartGarden</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Kami adalah tim yang berdedikasi untuk menggabungkan teknologi dan alam.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Ahmad Reza', role: 'Founder & CEO', img: 'https://i.pravatar.cc/300?u=reza' },
              { name: 'Sarah Wijaya', role: 'Head of Engineering', img: 'https://i.pravatar.cc/300?u=sarah' },
              { name: 'Bima Satria', role: 'IoT Specialist', img: 'https://i.pravatar.cc/300?u=bima' }
            ].map((member, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="relative w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <Image src={member.img} alt={member.name} fill className="object-cover" referrerPolicy="no-referrer" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">{member.name}</h3>
                <p className="text-emerald-600 font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-900 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row">
            <div className="md:w-1/2 p-12 lg:p-16 text-white">
              <h2 className="text-3xl font-bold mb-6">Hubungi Kami</h2>
              <p className="text-emerald-100 mb-10 text-lg">
                Punya pertanyaan tentang SmartGarden atau ingin berdiskusi tentang kebutuhan kebun Anda? Tim kami siap membantu.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-300">Email</p>
                    <p className="font-medium text-lg">hello@smartgarden.id</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-300">Telepon</p>
                    <p className="font-medium text-lg">+62 811 2345 6789</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-800 rounded-full flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-sm text-emerald-300">Kantor Pusat</p>
                    <p className="font-medium text-lg">Gedung Inovasi Lt. 4<br/>Jakarta Selatan, Indonesia</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 bg-white p-12 lg:p-16">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Nama Lengkap</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="Masukkan nama Anda" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all" placeholder="email@contoh.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Pesan</label>
                  <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all resize-none" placeholder="Bagaimana kami bisa membantu?"></textarea>
                </div>
                <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-emerald-600/30">
                  Kirim Pesan
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
