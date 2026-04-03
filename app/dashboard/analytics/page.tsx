'use client';

<<<<<<< HEAD
import { useState, useEffect, useCallback } from 'react';
=======
import { useState, useEffect } from 'react';
>>>>>>> 9e82f86d14baeac1da960feb4b82a995de088107
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend } from 'recharts';
import { Activity, Droplets, Thermometer, Calendar } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [deviceId, setDeviceId] = useState('');
  const [historyData, setHistoryData] = useState<any[]>([]);

<<<<<<< HEAD
  // Since we only have 'garden_stats' which stores current state, 
  // we will generate some realistic mock historical data for demonstration.
  // In a production app, you would fetch this from a 'garden_history' table.
  const generateMockHistoryData = useCallback(() => {
=======
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const savedDevice = localStorage.getItem('smartgarden_device_id');
      if (savedDevice) {
        setDeviceId(savedDevice);
        generateMockHistoryData(); // In a real app, fetch from a history table
      } else {
        router.push('/dashboard');
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router]);

  // Since we only have 'garden_stats' which stores current state, 
  // we will generate some realistic mock historical data for demonstration.
  // In a production app, you would fetch this from a 'garden_history' table.
  const generateMockHistoryData = () => {
>>>>>>> 9e82f86d14baeac1da960feb4b82a995de088107
    const data = [];
    const now = new Date();
    let temp = 28;
    let moisture = 45;
    
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      
      // Add some realistic fluctuation
      // Temperature peaks in afternoon, drops at night
      const hour = time.getHours();
      if (hour > 8 && hour < 16) temp += Math.random() * 2;
      else temp -= Math.random() * 1.5;
      
      // Moisture slowly drops, goes up sharply if pump turns on
      moisture -= Math.random() * 2;
      if (moisture < 25) moisture += 40; // Simulate watering
      
      // Clamp values
      temp = Math.max(20, Math.min(38, temp));
      moisture = Math.max(10, Math.min(90, moisture));
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        temp: parseFloat(temp.toFixed(1)),
        moisture: parseFloat(moisture.toFixed(1)),
      });
    }
    setHistoryData(data);
<<<<<<< HEAD
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }
      
      const savedDevice = localStorage.getItem('smartgarden_device_id');
      if (savedDevice) {
        setDeviceId(savedDevice);
        generateMockHistoryData(); // In a real app, fetch from a history table
      } else {
        router.push('/dashboard');
      }
      setIsLoading(false);
    };
    
    checkAuth();
  }, [router, generateMockHistoryData]);
=======
  };
>>>>>>> 9e82f86d14baeac1da960feb4b82a995de088107

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Analitik Kebun</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Menampilkan data historis untuk perangkat <span className="font-mono bg-slate-200 px-2 py-0.5 rounded text-xs text-slate-700">{deviceId}</span>
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button className="px-4 py-2 text-sm font-medium bg-emerald-50 text-emerald-700 rounded-md">24 Jam</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">7 Hari</button>
            <button className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition-colors">30 Hari</button>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Temperature Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Thermometer className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tren Suhu</h2>
                <p className="text-xs text-slate-500">Fluktuasi suhu 24 jam terakhir</p>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={['dataMin - 2', 'dataMax + 2']} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value}°C`, 'Suhu']}
                  />
                  <Area type="monotone" dataKey="temp" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Moisture Chart */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Droplets className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-800">Tren Kelembapan</h2>
                <p className="text-xs text-slate-500">Tingkat kelembapan tanah 24 jam terakhir</p>
              </div>
            </div>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value}%`, 'Kelembapan']}
                  />
                  <Area type="stepAfter" dataKey="moisture" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorMoisture)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Rata-rata Suhu', value: '29.4°C', trend: '+1.2°C', isPositive: false },
            { label: 'Rata-rata Kelembapan', value: '42%', trend: '-5%', isPositive: false },
            { label: 'Total Penyiraman', value: '3 Kali', trend: 'Sesuai Jadwal', isPositive: true },
            { label: 'Efisiensi Air', value: '94%', trend: '+2%', isPositive: true },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + (i * 0.05) }}
              className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
            >
              <p className="text-sm text-slate-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2">{stat.value}</p>
              <div className={`text-xs font-medium px-2 py-1 rounded-md inline-block ${stat.isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>
                {stat.trend}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
