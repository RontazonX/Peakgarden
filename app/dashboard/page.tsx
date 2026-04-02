'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Thermometer, Power, Lock, KeyRound, Sprout, AlertTriangle, LogOut, Cpu, Activity, Settings2, Bell, BellOff, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';

// Types
type AppState = 'CONNECT_DEVICE' | 'DASHBOARD';

interface SensorData {
  temp: number;
  moisture: number;
  pump: number;
}

interface DeviceSettings {
  tempThreshold: number;
  moistureThreshold: number;
  notificationsEnabled: number;
}

export default function SmartGardenApp() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('CONNECT_DEVICE');
  
  const [deviceId, setDeviceId] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  
  // Data State
  const [sensorData, setSensorData] = useState<SensorData>({ temp: 0, moisture: 0, pump: 0 });
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({ tempThreshold: 33, moistureThreshold: 20, notificationsEnabled: 0 });
  const [showSettings, setShowSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [pumpHistory, setPumpHistory] = useState<{ time: string, status: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const lastNotifRef = useRef<number>(0);

  useEffect(() => {
    // Check Auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();

    // Check saved device
    const savedDevice = localStorage.getItem('smartgarden_device_id');
    if (savedDevice) {
      setDeviceId(savedDevice);
      setRememberDevice(true);
    }
  }, [router]);

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
        console.warn('No data found for this device yet. Waiting for device to sync...');
      }

      if (rememberDevice) {
        localStorage.setItem('smartgarden_device_id', deviceId);
      } else {
        localStorage.removeItem('smartgarden_device_id');
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
            if (item.sensor_name === 'pump') {
              newData.pump = item.value;
              // Initialize pump history with the current state if empty
              setPumpHistory(ph => {
                if (ph.length === 0) {
                  return [{
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                    status: item.value
                  }];
                }
                return ph;
              });
            }
          });
          return newData;
        });
        
        setDeviceSettings(prev => {
          const newSettings = { ...prev };
          data.forEach((item: any) => {
            if (item.sensor_name === 'temp_threshold') newSettings.tempThreshold = item.value;
            if (item.sensor_name === 'moisture_threshold') newSettings.moistureThreshold = item.value;
            if (item.sensor_name === 'notifications_enabled') newSettings.notificationsEnabled = item.value;
          });
          return newSettings;
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

  // Realtime updates
  useEffect(() => {
    if (appState === 'DASHBOARD' && deviceId) {
      fetchLatestData(); // Initial fetch

      // Subscribe to real-time changes from Supabase
      const channel = supabase
        .channel('garden_stats_changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events
            schema: 'public',
            table: 'garden_stats',
            filter: `device_id=eq.${deviceId}`
          },
          (payload) => {
            const newData = (payload.new || payload.old) as any;
            if (!newData) return;
            const { sensor_name, value } = newData;
            
            if (['temp', 'moisture', 'pump'].includes(sensor_name)) {
              setSensorData(prev => ({ ...prev, [sensor_name]: value }));
              setLastUpdated(new Date());
            } else if (['temp_threshold', 'moisture_threshold', 'notifications_enabled'].includes(sensor_name)) {
              setDeviceSettings(prev => {
                const updated = { ...prev };
                if (sensor_name === 'temp_threshold') updated.tempThreshold = value;
                if (sensor_name === 'moisture_threshold') updated.moistureThreshold = value;
                if (sensor_name === 'notifications_enabled') updated.notificationsEnabled = value;
                return updated;
              });
            }
            
            if (sensor_name === 'pump') {
              setPumpHistory(prev => {
                const newHistory = [...prev, {
                  time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                  status: value
                }];
                return newHistory.slice(-20); // Keep last 20 points
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [appState, deviceId, fetchLatestData]);

  // Notification Logic
  useEffect(() => {
    if (appState === 'DASHBOARD' && deviceSettings.notificationsEnabled === 1) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          Notification.requestPermission();
        } else if (Notification.permission === 'granted') {
          const now = Date.now();
          if (now - lastNotifRef.current > 60000) { // 1 minute cooldown
            if (sensorData.temp >= deviceSettings.tempThreshold) {
              new Notification('SmartGarden Alert', { 
                body: `Temperature is too high: ${sensorData.temp}°C!`,
              });
              lastNotifRef.current = now;
            } else if (sensorData.moisture <= deviceSettings.moistureThreshold) {
              new Notification('SmartGarden Alert', { 
                body: `Soil moisture is too low: ${sensorData.moisture}%!`,
              });
              lastNotifRef.current = now;
            }
          }
        }
      }
    }
  }, [sensorData.temp, sensorData.moisture, deviceSettings, appState]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates = [
        { device_id: deviceId, sensor_name: 'temp_threshold', value: deviceSettings.tempThreshold },
        { device_id: deviceId, sensor_name: 'moisture_threshold', value: deviceSettings.moistureThreshold },
        { device_id: deviceId, sensor_name: 'notifications_enabled', value: deviceSettings.notificationsEnabled }
      ];
      
      // Upsert each setting
      for (const update of updates) {
        const { data: existing } = await supabase
          .from('garden_stats')
          .select('id')
          .eq('device_id', deviceId)
          .eq('sensor_name', update.sensor_name)
          .single();
          
        if (existing) {
          await supabase.from('garden_stats').update({ value: update.value }).eq('id', existing.id);
        } else {
          await supabase.from('garden_stats').insert(update);
        }
      }
      setShowSettings(false);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleDisconnect = () => {
    setAppState('CONNECT_DEVICE');
    setDeviceId('');
  };

  const isOverheating = sensorData.temp >= deviceSettings.tempThreshold;
  const isLowMoisture = sensorData.moisture <= deviceSettings.moistureThreshold;

  if (isCheckingAuth) {
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

                <div className="flex items-center">
                  <input
                    id="remember-device"
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-slate-300 rounded"
                  />
                  <label htmlFor="remember-device" className="ml-2 block text-sm text-slate-600">
                    Ingat perangkat ini
                  </label>
                </div>

                <div className="flex gap-3">
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 rounded-xl transition-colors shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
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
                    onClick={() => setShowSettings(true)}
                    className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Alert Settings"
                  >
                    <Settings2 className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleDisconnect}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Disconnect"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6">
              
              {/* Alerts */}
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
                        Temperature has reached {sensorData.temp}°C (Threshold: {deviceSettings.tempThreshold}°C). The pump has been automatically activated by the device safety protocol.
                      </p>
                    </div>
                  </motion.div>
                )}
                {isLowMoisture && !isOverheating && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-start gap-4 overflow-hidden"
                  >
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                      <Droplets className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-orange-800">Low Moisture Alert!</h3>
                      <p className="text-orange-600 text-sm mt-1">
                        Soil moisture is at {sensorData.moisture}% (Threshold: {deviceSettings.moistureThreshold}%). Consider turning on the pump.
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

              {/* Pump Status History Chart */}
              <div className="mt-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5" />
                  </div>
                  <h2 className="font-semibold text-slate-700 text-lg">Pump Status History</h2>
                </div>
                
                <div className="h-64 w-full">
                  {pumpHistory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={pumpHistory} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="time" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          dy={10}
                        />
                        <YAxis 
                          domain={[0, 1]} 
                          ticks={[0, 1]} 
                          tickFormatter={(val) => val === 1 ? 'ON' : 'OFF'}
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 12 }}
                          dx={-10}
                        />
                        <Tooltip 
                          labelFormatter={(label) => `Time: ${label}`}
                          formatter={(value: any) => [value === 1 ? 'ON' : 'OFF', 'Status']}
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        />
                        <Line 
                          type="stepAfter" 
                          dataKey="status" 
                          stroke="#10b981" 
                          strokeWidth={3}
                          dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                          activeDot={{ r: 6, fill: '#10b981', strokeWidth: 0 }}
                          isAnimationActive={false}
                        />
                        <Brush 
                          dataKey="time" 
                          height={30} 
                          stroke="#10b981" 
                          fill="#f8fafc"
                          tickFormatter={() => ''}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
                      Waiting for pump activity data...
                    </div>
                  )}
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
      
      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Settings2 className="w-5 h-5 text-emerald-600" />
                  Alert Settings
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={saveSettings} className="p-6 space-y-6">
                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                    <span>Overheating Threshold (°C)</span>
                    <span className="text-emerald-600 font-bold">{deviceSettings.tempThreshold}°C</span>
                  </label>
                  <input 
                    type="range" 
                    min="20" max="50" step="1"
                    value={deviceSettings.tempThreshold}
                    onChange={(e) => setDeviceSettings(prev => ({ ...prev, tempThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                  <p className="text-xs text-slate-500 mt-2">Alert triggers when temperature exceeds this value.</p>
                </div>

                <div>
                  <label className="flex items-center justify-between text-sm font-medium text-slate-700 mb-2">
                    <span>Low Moisture Threshold (%)</span>
                    <span className="text-blue-600 font-bold">{deviceSettings.moistureThreshold}%</span>
                  </label>
                  <input 
                    type="range" 
                    min="0" max="100" step="5"
                    value={deviceSettings.moistureThreshold}
                    onChange={(e) => setDeviceSettings(prev => ({ ...prev, moistureThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <p className="text-xs text-slate-500 mt-2">Alert triggers when moisture falls below this value.</p>
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${deviceSettings.notificationsEnabled === 1 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                      {deviceSettings.notificationsEnabled === 1 ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-slate-700 text-sm">Browser Notifications</p>
                      <p className="text-xs text-slate-500">Receive alerts when app is open</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newVal = deviceSettings.notificationsEnabled === 1 ? 0 : 1;
                      setDeviceSettings(prev => ({ ...prev, notificationsEnabled: newVal }));
                      if (newVal === 1 && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                        Notification.requestPermission();
                      }
                    }}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                      deviceSettings.notificationsEnabled === 1 ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span 
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        deviceSettings.notificationsEnabled === 1 ? 'translate-x-6' : 'translate-x-1'
                      }`} 
                    />
                  </button>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-70 transition-all"
                  >
                    {isSavingSettings ? 'Saving...' : <><Save className="w-4 h-4" /> Save Settings</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
