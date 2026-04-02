'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Thermometer, Power, Lock, KeyRound, Sprout, AlertTriangle, LogOut, Cpu } from 'lucide-react';

// Initialize Supabase Client globally
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://vkcwjebggauutgoawlre.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY || '';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Types
type AppState = 'LOGIN' | 'CONNECT_DEVICE' | 'DASHBOARD';

interface SensorData {
  temp: number;
  moisture: number;
  pump: number;
}

export default function SmartGardenApp() {
  const [appState, setAppState] = useState<AppState>('CONNECT_DEVICE');
  
  const [deviceId, setDeviceId] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // Data State
  const [sensorData, setSensorData] = useState<SensorData>({ temp: 0, moisture: 0, pump: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Handle Device Connection
  const handleConnectDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deviceId.trim()) {
      setLoginError('Device ID cannot be empty.');
      return;
    }

    // Validation step: Check against predefined primary key
    const VALID_DEVICE_ID = 'GARDEN-001';
    if (deviceId.trim() !== VALID_DEVICE_ID) {
      setLoginError('Invalid Device ID. Please check the code and try again.');
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      // Test connection by fetching data for this specific device
      const { data, error } = await supabase
        .from('garden_stats')
        .select('value')
        .eq('device_id', deviceId)
        .limit(1);

      if (error) throw error;

      if (data && data.length === 0) {
        // Optional: You can warn the user if no data exists yet, but still let them in
        console.warn('No data found for this device yet. Waiting for device to sync...');
      }

      setAppState('DASHBOARD');
    } catch (err: any) {
      console.error('Connection error details:', err);
      
      let errorMessage = 'Unknown database error';
      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.details) {
        errorMessage = err.details;
      } else if (typeof err === 'object') {
        errorMessage = JSON.stringify(err);
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setLoginError(`Connection failed: ${errorMessage}. Please check your Supabase configuration and RLS policies.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch Data from Supabase
  const fetchLatestData = useCallback(async () => {
    if (!deviceId) return;
    try {
      const { data, error } = await supabase
        .from('garden_stats')
        .select('sensor_name, value')
        .eq('device_id', deviceId);
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        setSensorData(prev => {
          const newData = { ...prev };
          data.forEach((item: any) => {
            if (item.sensor_name === 'temp') newData.temp = item.value;
            if (item.sensor_name === 'moisture') newData.moisture = item.value;
            if (item.sensor_name === 'pump') newData.pump = item.value;
          });
          return newData;
        });
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      let errorMessage = 'Unknown database error';
      if (err?.message) errorMessage = err.message;
      else if (err?.details) errorMessage = err.details;
      else if (typeof err === 'object') errorMessage = JSON.stringify(err);
      else if (typeof err === 'string') errorMessage = err;
      
      console.error('Error fetching data:', errorMessage, err);
    }
  }, [deviceId]);

  // Toggle Pump
  const togglePump = async () => {
    if (!deviceId) return;
    
    const newValue = sensorData.pump === 1 ? 0 : 1;
    
    // Optimistic update
    setSensorData(prev => ({ ...prev, pump: newValue }));
    
    try {
      const { error } = await supabase
        .from('garden_stats')
        .update({ value: newValue })
        .eq('device_id', deviceId)
        .eq('sensor_name', 'pump');
        
      if (error) {
        throw error;
      }
    } catch (err: any) {
      let errorMessage = 'Unknown database error';
      if (err?.message) errorMessage = err.message;
      else if (err?.details) errorMessage = err.details;
      else if (typeof err === 'object') errorMessage = JSON.stringify(err);
      else if (typeof err === 'string') errorMessage = err;

      console.error('Error updating pump:', errorMessage, err);
      // Revert on error
      setSensorData(prev => ({ ...prev, pump: newValue === 1 ? 0 : 1 }));
    }
  };

  // Polling for updates
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (appState === 'DASHBOARD' && deviceId) {
      fetchLatestData(); // Initial fetch
      interval = setInterval(() => {
        fetchLatestData();
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [appState, deviceId, fetchLatestData]);

  const handleLogout = () => {
    setAppState('CONNECT_DEVICE');
    setDeviceId('');
  };

  const isOverheating = sensorData.temp >= 33;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 pt-20">
      <AnimatePresence mode="wait">
        {appState === 'CONNECT_DEVICE' && (
          <motion.div 
            key="connect"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="min-h-screen flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
              <div className="p-8 text-center border-b border-slate-100">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Connect Device</h2>
                <p className="text-slate-500 mt-2">Enter your IoT Device ID</p>
              </div>
              
              <form onSubmit={handleConnectDevice} className="p-8 space-y-6">
                {loginError && (
                  <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
                    {loginError}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">Device ID</label>
                  <div className="relative">
                    <Cpu className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                      type="text" 
                      value={deviceId}
                      onChange={(e) => setDeviceId(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all font-mono text-sm"
                      placeholder="e.g., GARDEN-001"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-2">
                    This is the unique identifier for your specific smart garden device.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setAppState('LOGIN')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-3 rounded-xl transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 rounded-xl transition-colors shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <motion.div 
                        animate={{ rotate: 360 }} 
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : 'Connect'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {appState === 'DASHBOARD' && (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col"
          >
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
              <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Sprout className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h1 className="font-bold text-slate-800 leading-tight">Smart Garden</h1>
                    <p className="text-xs text-slate-500">Connected to Device</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                    Live Sync
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* Overheating Alert */}
              <AnimatePresence>
                {isOverheating && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-4 overflow-hidden"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-red-800">Overheating Alert!</h3>
                      <p className="text-red-600 text-sm mt-1">
                        Temperature has reached {sensorData.temp}°C. The pump has been automatically activated by the device safety protocol.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Temperature Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Thermometer className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isOverheating ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'}`}>
                      <Thermometer className="w-6 h-6" />
                    </div>
                    <h2 className="font-semibold text-slate-700 text-lg">Temperature</h2>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-5xl font-bold tracking-tight ${isOverheating ? 'text-red-600' : 'text-slate-800'}`}>
                        {sensorData.temp.toFixed(1)}
                      </span>
                      <span className="text-2xl font-medium text-slate-400">°C</span>
                    </div>
                    <p className="text-sm text-slate-500 mt-2">
                      {isOverheating ? 'Critical high temperature' : 'Optimal growing temperature'}
                    </p>
                  </div>
                </div>

                {/* Moisture Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Droplets className="w-32 h-32" />
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                      <Droplets className="w-6 h-6" />
                    </div>
                    <h2 className="font-semibold text-slate-700 text-lg">Soil Moisture</h2>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold tracking-tight text-slate-800">
                        {sensorData.moisture}
                      </span>
                      <span className="text-2xl font-medium text-slate-400">%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
                      <motion.div 
                        className="bg-blue-500 h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${sensorData.moisture}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Pump Control Card */}
                <div className={`rounded-3xl p-6 shadow-sm border transition-colors duration-300 flex flex-col ${sensorData.pump === 1 || isOverheating ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-white border-slate-100 text-slate-800'}`}>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${sensorData.pump === 1 || isOverheating ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                        <Power className="w-6 h-6" />
                      </div>
                      <h2 className={`font-semibold text-lg ${sensorData.pump === 1 || isOverheating ? 'text-white' : 'text-slate-700'}`}>Water Pump</h2>
                    </div>
                    
                    {/* Toggle Switch */}
                    <button 
                      onClick={togglePump}
                      disabled={isOverheating}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${
                        isOverheating ? 'bg-emerald-400 cursor-not-allowed' :
                        sensorData.pump === 1 ? 'bg-emerald-400' : 'bg-slate-200'
                      }`}
                    >
                      <span 
                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                          sensorData.pump === 1 || isOverheating ? 'translate-x-7' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="text-3xl font-bold tracking-tight mb-2">
                      {sensorData.pump === 1 || isOverheating ? 'ACTIVE' : 'STANDBY'}
                    </div>
                    <p className={`text-sm ${sensorData.pump === 1 || isOverheating ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {isOverheating 
                        ? 'Forced ON due to overheating' 
                        : sensorData.pump === 1 
                          ? 'Manual watering in progress' 
                          : 'Pump is currently off'}
                    </p>
                  </div>
                </div>

              </div>

              {/* System Status Footer */}
              <div className="flex items-center justify-between text-sm text-slate-500 pt-8">
                <p>Device ID: <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{deviceId}</span></p>
                <p>Last synced: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
              </div>

            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
