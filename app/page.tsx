'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, ShieldCheck, Smartphone, Zap, CheckCircle2, Star, Quote, Activity } from 'lucide-react';

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
        {/* Cinematic Video Background */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          <iframe
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-[100vh] min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 opacity-20"
            src="https://www.youtube.com/embed/LXb3EKWsInQ?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=LXb3EKWsInQ&modestbranding=1"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/70 to-white/90 z-0"></div>
        
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
            <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Keunggulan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Fitur Unggulan Kami</h2>
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
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
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

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img src="https://picsum.photos/seed/smartfarm/800/600" alt="Smart Farming" className="w-full h-auto object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
                      <Activity className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Status Sensor</p>
                      <p className="text-xs text-slate-500">Sinkronisasi Real-time Aktif</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:w-1/2 space-y-8"
            >
              <div>
                <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Cara Kerja</span>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Otomatisasi Cerdas untuk Hasil Maksimal</h2>
                <p className="text-lg text-slate-600">
                  Sistem kami menggunakan sensor IoT yang terhubung langsung ke cloud, memberikan Anda kendali penuh atas kebun Anda.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  { title: 'Pasang Perangkat IoT', desc: 'Hubungkan sensor suhu dan kelembapan ke tanah dan mikrokontroler Anda.' },
                  { title: 'Koneksikan ke WiFi', desc: 'Perangkat akan otomatis mengirimkan data secara real-time ke server Supabase kami.' },
                  { title: 'Pantau & Kendalikan', desc: 'Buka dashboard dari perangkat apa saja untuk memantau status dan mengatur jadwal pompa.' }
                ].map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-1">{step.title}</h4>
                      <p className="text-slate-600">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Devices Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Perangkat Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Pilih Perangkat Sesuai Kebutuhan</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Dari tanaman hias di rumah hingga produksi masal di lahan pertanian, kami menyediakan perangkat keras yang tangguh dan mudah digunakan.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { name: 'SmartGarden Home', price: 'Rp 299.000', desc: 'Ideal untuk tanaman hias dan kebun mini di rumah.', features: ['1 Sensor Suhu & Kelembapan', '1 Modul Kontrol Pompa', 'Koneksi WiFi 2.4GHz', 'Akses Dashboard Gratis', 'Instalasi Mudah (Plug & Play)'] },
              { name: 'SmartGarden Pro', price: 'Rp 899.000', desc: 'Solusi lengkap untuk greenhouse dan urban farming.', features: ['3 Sensor Suhu & Kelembapan', 'Kontrol 2 Pompa Terpisah', 'Sensor Intensitas Cahaya', 'Baterai Cadangan', 'Notifikasi Telegram/Email'], popular: true },
              { name: 'SmartGarden Farm', price: 'Hubungi Kami', desc: 'Sistem terintegrasi untuk produksi masal dan lahan luas.', features: ['Sensor Jaringan Mesh (Unlimited)', 'Kontrol Irigasi Presisi', 'Integrasi Panel Surya', 'Analisis Data AI', 'Dukungan Teknisi On-site'] }
            ].map((device, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`bg-white rounded-3xl p-8 border ${device.popular ? 'border-emerald-500 shadow-xl shadow-emerald-100 relative' : 'border-slate-200 shadow-sm'}`}
              >
                {device.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                    Paling Populer
                  </div>
                )}
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{device.name}</h3>
                <p className="text-slate-500 mb-6">{device.desc}</p>
                <div className="mb-8">
                  <span className="text-4xl font-extrabold text-slate-900">{device.price}</span>
                </div>
                <ul className="space-y-4 mb-8">
                  {device.features.map((feat, j) => (
                    <li key={j} className="flex items-center gap-3 text-slate-600">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  href="/about" 
                  className={`block w-full text-center py-3 rounded-xl font-bold transition-colors ${device.popular ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Pesan Sekarang
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder / CEO Section */}
      <section className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-square max-w-md mx-auto">
                <img src="https://i.pravatar.cc/600?u=reza" alt="Ahmad Reza - Founder & CEO" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl font-bold text-white">Ahmad Reza</h3>
                  <p className="text-emerald-400 font-medium">Founder & CEO SmartGarden</p>
                </div>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 space-y-6"
            >
              <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Pesan Founder</span>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Membawa Teknologi ke Setiap Lahan Pertanian</h2>
              <div className="relative">
                <Quote className="absolute -top-4 -left-4 w-12 h-12 text-emerald-100 -z-10" />
                <p className="text-xl text-slate-700 italic leading-relaxed">
                  &quot;Kami percaya bahwa masa depan pertanian ada di tangan teknologi. SmartGarden lahir dari keresahan kami melihat banyak petani dan penghobi tanaman yang kesulitan memantau kondisi lahan mereka secara real-time. Misi kami adalah mendemokratisasi teknologi IoT agar dapat diakses oleh semua kalangan, dari kebun rumah hingga perkebunan skala besar.&quot;
                </p>
              </div>
              <div className="pt-6 flex gap-8">
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-emerald-600">10+</span>
                  <span className="text-sm text-slate-500 font-medium">Tahun Pengalaman</span>
                </div>
                <div className="w-px bg-slate-200"></div>
                <div className="flex flex-col">
                  <span className="text-3xl font-extrabold text-emerald-600">500+</span>
                  <span className="text-sm text-slate-500 font-medium">Mitra Petani</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold tracking-wider uppercase text-sm">Testimoni</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mt-2 mb-4">Apa Kata Mereka?</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Budi Santoso', role: 'Petani Hidroponik', text: 'Sejak menggunakan SmartGarden, hasil panen selada saya meningkat 30%. Sistem otomatisnya sangat membantu saat saya sedang tidak di kebun.' },
              { name: 'Siti Aminah', role: 'Penghobi Tanaman Hias', text: 'Sangat mudah digunakan! Saya bisa memantau kelembapan monstera saya dari kantor. Notifikasinya sangat responsif.' },
              { name: 'AgroTech Farm', role: 'Perkebunan Komersial', text: 'Dashboard yang sangat informatif. Kami menggunakan paket Enterprise dan integrasi datanya sangat mulus dengan sistem internal kami.' }
            ].map((testi, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-slate-50 p-8 rounded-3xl relative"
              >
                <Quote className="absolute top-6 right-6 w-10 h-10 text-emerald-200" />
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-5 h-5 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-700 mb-6 italic">&quot;{testi.text}&quot;</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-full overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${i}`} alt={testi.name} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{testi.name}</h4>
                    <p className="text-sm text-slate-500">{testi.role}</p>
                  </div>
                </div>
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
