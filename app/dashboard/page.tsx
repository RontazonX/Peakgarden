'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Droplets, Thermometer, Power, Lock, KeyRound, Sprout, AlertTriangle, LogOut, Cpu, Activity, Settings2, Bell, BellOff, Save, X, CheckCircle2, LayoutGrid, MessageSquare, Leaf, LineChart as LineChartIcon, CloudSun, Users, CreditCard, Settings, ChevronDown, Wind, FlaskConical, Layers, Search, Plus, Minus, ChevronUp, MoreHorizontal, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush } from 'recharts';
import Markdown from 'react-markdown';

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
  scheduleEnabled: number;
  scheduleOnTime: number; // minutes from midnight
  scheduleOffTime: number; // minutes from midnight
}

// Helper functions for time conversion
const minutesToTimeStr = (mins: number) => {
  const h = Math.floor(mins / 60).toString().padStart(2, '0');
  const m = (mins % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const timeStrToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

export default function SmartGardenApp() {
  const router = useRouter();
  const [appState, setAppState] = useState<AppState>('CONNECT_DEVICE');
  
  const [deviceId, setDeviceId] = useState('');
  const [deviceIdError, setDeviceIdError] = useState('');
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [userProfile, setUserProfile] = useState<{ name: string, email: string, avatarUrl: string } | null>(null);
  
  // Data State
  const [sensorData, setSensorData] = useState<SensorData>({ temp: 0, moisture: 0, pump: 0 });
  const [selectedRegion, setSelectedRegion] = useState('Jakarta, ID');
  const [weatherData, setWeatherData] = useState({ temp: 32, condition: 'Partly Cloudy', wind: 3, humidity: 65 });
  
  // Update weather when region changes
  useEffect(() => {
    const mockWeather: Record<string, any> = {
      'Jakarta, ID': { temp: 32, condition: 'Partly Cloudy', wind: 3, humidity: 65 },
      'Bandung, ID': { temp: 24, condition: 'Rainy', wind: 5, humidity: 80 },
      'Surabaya, ID': { temp: 34, condition: 'Sunny', wind: 2, humidity: 55 },
      'Bali, ID': { temp: 29, condition: 'Clear', wind: 4, humidity: 70 },
    };
    if (mockWeather[selectedRegion]) {
      setWeatherData(mockWeather[selectedRegion]);
    }
  }, [selectedRegion]);
  const [deviceSettings, setDeviceSettings] = useState<DeviceSettings>({ 
    tempThreshold: 33, 
    moistureThreshold: 20, 
    notificationsEnabled: 0,
    scheduleEnabled: 0,
    scheduleOnTime: 480, // 08:00
    scheduleOffTime: 540 // 09:00
  });
  const [showSettings, setShowSettings] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState('');
  const [pumpHistory, setPumpHistory] = useState<{ time: string, status: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [deviceStatus, setDeviceStatus] = useState<'online' | 'offline' | 'connecting'>('connecting');
  const lastNotifRef = useRef<number>(0);

  // Chat State
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    {
      role: 'user',
      content: 'Give me recommendation for Area 1'
    },
    {
      role: 'assistant',
      content: 'Sure, here are my recommendation for your Area 1 (Rice Field):\n- Monitor soil moisture over next 48 hours\n- Maintain current fertilization level\n- Prepare for mid-season pest inspection\n- Keep the water auto watering on.\n\nPlease check again after 2 days'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });
      
      const prompt = `You are an AI Assistant for a Smart Garden dashboard. 
The current sensor data is: Temperature: ${sensorData.temp}°C, Soil Moisture: ${sensorData.moisture}%, Pump Status: ${sensorData.pump === 1 ? 'ON' : 'OFF'}.
The user is asking: "${userMessage}"
Provide a helpful, concise response in markdown format.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      if (response.text) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: response.text! }]);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while processing your request.' }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    if (!lastUpdated) {
      setDeviceStatus('connecting');
      return;
    }
    
    const checkStatus = () => {
      const now = new Date();
      const diff = now.getTime() - lastUpdated.getTime();
      // If last update was within 30 seconds, consider it online
      if (diff < 30000) {
        setDeviceStatus('online');
      } else {
        setDeviceStatus('offline');
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  useEffect(() => {
    // Check Auth
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        const user = session.user;
        setUserProfile({
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
          email: user.email || '',
          avatarUrl: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || user.email || 'User')}&background=10b981&color=fff`
        });
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
    if (deviceIdError || !deviceId.trim()) {
      setLoginError('Please provide a valid Device ID.');
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
        .select('sensor_name, value, updated_at')
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
            if (item.sensor_name === 'schedule_enabled') newSettings.scheduleEnabled = item.value;
            if (item.sensor_name === 'schedule_on_time') newSettings.scheduleOnTime = item.value;
            if (item.sensor_name === 'schedule_off_time') newSettings.scheduleOffTime = item.value;
          });
          return newSettings;
        });
        
        // Find the most recent updated_at timestamp from the data
        let latestUpdate = new Date(0);
        let hasUpdatedAt = false;
        
        data.forEach((item: any) => {
          if (item.updated_at && ['temp', 'moisture'].includes(item.sensor_name)) {
            hasUpdatedAt = true;
            const itemDate = new Date(item.updated_at);
            if (itemDate > latestUpdate) {
              latestUpdate = itemDate;
            }
          }
        });
        
        if (hasUpdatedAt) {
          setLastUpdated(latestUpdate);
        } else {
          // If no timestamp is available, we assume it's offline until we receive a real-time update
          setLastUpdated(new Date(0));
        }
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
              // Only update lastUpdated for sensor readings, not pump toggles (which could be from the user)
              if (['temp', 'moisture'].includes(sensor_name)) {
                setLastUpdated(new Date());
              }
            } else if (['temp_threshold', 'moisture_threshold', 'notifications_enabled', 'schedule_enabled', 'schedule_on_time', 'schedule_off_time'].includes(sensor_name)) {
              setDeviceSettings(prev => {
                const updated = { ...prev };
                if (sensor_name === 'temp_threshold') updated.tempThreshold = value;
                if (sensor_name === 'moisture_threshold') updated.moistureThreshold = value;
                if (sensor_name === 'notifications_enabled') updated.notificationsEnabled = value;
                if (sensor_name === 'schedule_enabled') updated.scheduleEnabled = value;
                if (sensor_name === 'schedule_on_time') updated.scheduleOnTime = value;
                if (sensor_name === 'schedule_off_time') updated.scheduleOffTime = value;
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

  // Frontend Schedule Checker
  useEffect(() => {
    if (appState !== 'DASHBOARD' || deviceSettings.scheduleEnabled !== 1 || !deviceId) return;
    
    const checkSchedule = async () => {
      const now = new Date();
      const currentMins = now.getHours() * 60 + now.getMinutes();
      
      // If it's the exact minute to turn ON and pump is OFF
      if (currentMins === deviceSettings.scheduleOnTime && sensorData.pump === 0) {
        setSensorData(prev => ({ ...prev, pump: 1 }));
        await supabase.from('garden_stats').update({ value: 1 }).eq('device_id', deviceId).eq('sensor_name', 'pump');
      }
      // If it's the exact minute to turn OFF and pump is ON
      else if (currentMins === deviceSettings.scheduleOffTime && sensorData.pump === 1) {
        setSensorData(prev => ({ ...prev, pump: 0 }));
        await supabase.from('garden_stats').update({ value: 0 }).eq('device_id', deviceId).eq('sensor_name', 'pump');
      }
    };
    
    const interval = setInterval(checkSchedule, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [appState, deviceSettings, sensorData.pump, deviceId]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates = [
        { device_id: deviceId, sensor_name: 'temp_threshold', value: deviceSettings.tempThreshold },
        { device_id: deviceId, sensor_name: 'moisture_threshold', value: deviceSettings.moistureThreshold },
        { device_id: deviceId, sensor_name: 'notifications_enabled', value: deviceSettings.notificationsEnabled },
        { device_id: deviceId, sensor_name: 'schedule_enabled', value: deviceSettings.scheduleEnabled },
        { device_id: deviceId, sensor_name: 'schedule_on_time', value: deviceSettings.scheduleOnTime },
        { device_id: deviceId, sensor_name: 'schedule_off_time', value: deviceSettings.scheduleOffTime }
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
      
      setSaveSuccessMessage('Settings saved successfully!');
      setTimeout(() => {
        setSaveSuccessMessage('');
        setShowSettings(false);
      }, 2000);
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
    <div className={`min-h-screen bg-[#F3F4F6] text-slate-900 font-sans selection:bg-emerald-200 ${appState === 'CONNECT_DEVICE' ? 'pt-20' : ''}`}>
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
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setDeviceId(val);
                        if (!val) {
                          setDeviceIdError('Device ID is required.');
                        } else if (!/^GARDEN-\d{3}$/.test(val)) {
                          setDeviceIdError('Format must be GARDEN-XXX (e.g., GARDEN-001).');
                        } else {
                          setDeviceIdError('');
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3 rounded-xl border ${deviceIdError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-slate-200 focus:ring-emerald-500 focus:border-emerald-500'} outline-none transition-all font-mono text-sm`}
                      placeholder="e.g., GARDEN-001"
                      required
                    />
                  </div>
                  {deviceIdError ? (
                    <p className="text-xs text-red-500 mt-2">{deviceIdError}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-2">
                      This is the unique identifier for your specific smart garden device.
                    </p>
                  )}
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
                    disabled={isLoading || !!deviceIdError || !deviceId}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-2"
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
            className="min-h-screen flex flex-row"
          >
            {/* Sidebar */}
            <aside className="w-20 bg-[#F3F4F6] border-r border-slate-200 flex flex-col items-center py-6 gap-8 shrink-0 h-screen sticky top-0 z-50">
              {/* Logo */}
              <div className="w-12 h-12 bg-emerald-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-700/20">
                <Sprout className="w-6 h-6" />
              </div>
              
              {/* Navigation Icons */}
              <nav className="flex flex-col gap-4 w-full items-center flex-1">
                <button className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-slate-700 transition-transform hover:scale-105">
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <Activity className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <MessageSquare className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-px bg-slate-200 my-2"></div>
                
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <Leaf className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <LineChartIcon className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <Droplets className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <CloudSun className="w-5 h-5" />
                </button>
                
                <div className="w-10 h-px bg-slate-200 my-2"></div>
                
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <Users className="w-5 h-5" />
                </button>
                <button className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all">
                  <CreditCard className="w-5 h-5" />
                </button>
              </nav>
              
              <button 
                onClick={() => setShowSettings(true)}
                className="w-12 h-12 text-slate-400 hover:text-slate-700 hover:bg-white/50 rounded-2xl flex items-center justify-center transition-all mt-auto"
              >
                <Settings className="w-5 h-5" />
              </button>
              <button 
                onClick={handleDisconnect}
                className="w-12 h-12 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-2xl flex items-center justify-center transition-all"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 p-8 h-screen overflow-y-auto w-full">
              
              {/* Header */}
              <header className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-serif text-slate-900 mb-2">Hi, {userProfile?.name?.split(' ')[0] || 'User'}!</h1>
                  <p className="text-slate-500 text-sm">Your farm performance is stable. Here&apos;s today&apos;s overview.</p>
                </div>
                
                <div className="flex items-center gap-3 bg-white p-1.5 pr-4 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={userProfile?.avatarUrl || "https://i.pravatar.cc/150?u=user"} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                    <p className="text-sm font-semibold text-slate-900 leading-tight">{userProfile?.name || 'User'}</p>
                    <p className="text-[10px] text-slate-500 leading-tight">{userProfile?.email || 'user@example.com'}</p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 ml-2" />
                </div>
              </header>

              {/* Dashboard Grid */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 max-w-[1600px] mx-auto">
                
                {/* Left Column (Span 4) */}
                <div className="xl:col-span-5 flex flex-col gap-6">
                  
                  {/* Weather Card */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <h3 className="text-lg font-medium text-slate-800">{weatherData.condition}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <select 
                            value={selectedRegion}
                            onChange={(e) => setSelectedRegion(e.target.value)}
                            className="text-sm text-slate-500 bg-transparent border-none outline-none cursor-pointer hover:text-emerald-600 transition-colors appearance-none pr-4 relative z-10"
                          >
                            <option value="Jakarta, ID">Jakarta, ID</option>
                            <option value="Bandung, ID">Bandung, ID</option>
                            <option value="Surabaya, ID">Surabaya, ID</option>
                            <option value="Bali, ID">Bali, ID</option>
                          </select>
                          <ChevronDown className="w-3 h-3 text-slate-400 -ml-5" />
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-serif text-slate-900">{new Date().getDate()}</span>
                        <span className="text-sm text-slate-500 font-medium">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="my-4">
                        <CloudSun className="w-20 h-20 text-slate-300 drop-shadow-md" />
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4 bg-[#F8FAFC] px-4 py-3 rounded-2xl border border-slate-50">
                          <Thermometer className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-500 w-24">Temperature</span>
                          <span className="font-medium text-slate-900">{weatherData.temp} °C</span>
                        </div>
                        <div className="flex items-center gap-4 bg-[#F8FAFC] px-4 py-3 rounded-2xl border border-slate-50">
                          <Wind className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-500 w-24">Wind</span>
                          <span className="font-medium text-slate-900">{weatherData.wind} m/s</span>
                        </div>
                        <div className="flex items-center gap-4 bg-[#F8FAFC] px-4 py-3 rounded-2xl border border-slate-50">
                          <Droplets className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-500 w-24">Humidity</span>
                          <span className="font-medium text-slate-900">{weatherData.humidity} %</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Plant Health & Active Zones */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                          <Leaf className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-slate-800">Plant Health</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-serif text-slate-900">95%</span>
                        <span className="text-sm text-slate-500">Excellent</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
                          <LayoutGrid className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="font-medium text-slate-800">Active Crop Zones</span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-serif text-slate-900">9</span>
                        <span className="text-sm text-slate-500">Zones</span>
                        <span className="text-xs text-emerald-600 font-medium ml-auto bg-emerald-50 px-2 py-1 rounded-full">+2 From yesterday</span>
                      </div>
                    </div>
                  </div>

                  {/* Soil Nutrient Status */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <h3 className="font-medium text-slate-800 mb-1">Soil Nutrient Status</h3>
                    <p className="text-sm text-slate-500 mb-6">Balanced nutrient composition</p>
                    <div className="flex items-center gap-6">
                      <div className="flex-1 h-8 flex items-end gap-1">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(i => (
                          <div key={i} className="flex-1 bg-emerald-500 rounded-t-sm" style={{ height: `${(i/12) * 100}%`, opacity: 0.3 + (i/12)*0.7 }}></div>
                        ))}
                      </div>
                      <span className="font-medium text-emerald-600">Optimal</span>
                    </div>
                  </div>

                  {/* Auto Watering & pH Balancer */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between">
                      <div>
                        <Droplets className="w-6 h-6 text-slate-800 mb-4" />
                        <h3 className="font-medium text-slate-800 mb-1">Auto Watering</h3>
                        <p className="text-xs text-slate-500 mb-6">Watering every 3 hours</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={async () => {
                            const newVal = sensorData.pump === 1 ? 0 : 1;
                            setSensorData(prev => ({ ...prev, pump: newVal }));
                            await supabase.from('garden_stats').update({ value: newVal }).eq('device_id', deviceId).eq('sensor_name', 'pump');
                          }}
                          className={`w-12 h-6 rounded-full p-1 transition-colors ${sensorData.pump === 1 ? 'bg-blue-500' : 'bg-slate-200'}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${sensorData.pump === 1 ? 'translate-x-6' : 'translate-x-0'}`}></div>
                        </button>
                        <span className="text-sm font-medium text-slate-700">{sensorData.pump === 1 ? 'On' : 'Off'}</span>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden flex flex-col justify-between">
                      <div>
                        <FlaskConical className="w-6 h-6 text-slate-800 mb-4" />
                        <h3 className="font-medium text-slate-800 mb-1">pH Balancer</h3>
                        <p className="text-xs text-slate-500 mb-6">Status: Stable</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="w-12 h-6 rounded-full p-1 bg-blue-500 transition-colors cursor-default">
                          <div className="w-4 h-4 bg-white rounded-full shadow-sm translate-x-6"></div>
                        </button>
                        <span className="text-sm font-medium text-slate-700">Auto</span>
                      </div>
                      <div className="absolute bottom-6 right-6 text-4xl font-serif text-slate-900">6.4</div>
                    </div>
                  </div>

                  {/* Fertilizer Application Level */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-medium text-slate-800 mb-1">Fertilizer Application Level</h3>
                        <p className="text-sm text-slate-500">Current dosage intensity</p>
                      </div>
                      <span className="font-medium text-slate-800 text-sm">Moderate - High</span>
                    </div>
                    <div className="flex gap-1 h-10 items-end">
                      {Array.from({length: 40}).map((_, i) => (
                        <div 
                          key={i} 
                          className={`flex-1 rounded-full ${i < 20 ? 'bg-amber-500' : i < 32 ? 'bg-emerald-500' : 'bg-emerald-800'}`} 
                          style={{ 
                            opacity: i === 31 ? 1 : 0.7, 
                            height: i === 31 ? '120%' : '100%', 
                            transform: i === 31 ? 'translateY(-10%)' : 'none',
                            width: i === 31 ? '4px' : 'auto'
                          }}
                        ></div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Column (Span 7) */}
                <div className="xl:col-span-7 flex flex-col gap-6">
                  
                  {/* Map Card */}
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative h-[500px] flex-shrink-0">
                    <img src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=2070&auto=format&fit=crop" alt="Farm Map" className="w-full h-full object-cover" />
                    
                    {/* Map Controls */}
                    <div className="absolute top-6 left-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div className="absolute top-6 right-6 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors">
                      <Search className="w-5 h-5" />
                    </div>
                    <div className="absolute bottom-6 left-6 flex flex-col gap-2">
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors"><Plus className="w-5 h-5" /></div>
                      <div className="w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white cursor-pointer hover:bg-black/60 transition-colors"><Minus className="w-5 h-5" /></div>
                    </div>

                    {/* Overlay Card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 bg-[#354A35]/90 backdrop-blur-xl rounded-3xl p-6 text-white shadow-2xl">
                      <h3 className="font-medium mb-6 text-center text-emerald-50">Area 1: Rice Field</h3>
                      <div className="flex justify-between mb-6">
                        <div>
                          <p className="text-xs text-emerald-200/70 mb-1">Planting date</p>
                          <p className="text-sm font-medium">24 Aug 25</p>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-200/70 mb-1">Harvest Date</p>
                          <p className="text-sm font-medium">12 Dec 25</p>
                        </div>
                      </div>
                      <div className="mb-6">
                        <div className="flex justify-between text-xs mb-2">
                          <span className="text-emerald-200/70">Crop health</span>
                          <span className="font-medium">87 %</span>
                        </div>
                        <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400 w-[87%]"></div>
                        </div>
                      </div>
                      <div className="border-t border-white/10 pt-4">
                        <div className="flex justify-between items-center mb-4 cursor-pointer">
                          <span className="text-sm font-medium text-emerald-50">Sensor log</span>
                          <ChevronUp className="w-4 h-4 text-emerald-200/70" />
                        </div>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-emerald-200/70">Temperature</span>
                            <span>{sensorData.temp} °C</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-200/70">Humidity</span>
                            <span>{sensorData.moisture} %</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-emerald-200/70">Soil Moisture</span>
                            <span>68 %</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Growth & AI */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                    
                    {/* Growth Analytics */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col h-[450px]">
                      <h3 className="font-medium text-slate-800 mb-1">Growth Analytics</h3>
                      <p className="text-sm text-slate-500 mb-8">Strong nutrient balance</p>
                      
                      <div className="flex-1 flex flex-col items-center justify-center relative min-h-[160px]">
                        {/* Mock Gauge */}
                        <div className="w-48 h-24 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-slate-100 border-b-transparent border-r-transparent rotate-45"></div>
                          <div className="absolute top-0 left-0 w-48 h-48 rounded-full border-[16px] border-emerald-500 border-b-transparent border-r-transparent" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: 'rotate(45deg) rotate(87deg)' }}></div>
                          {/* Dashed lines for gauge */}
                          <div className="absolute inset-0 rounded-full border-[16px] border-dashed border-white/40 border-b-transparent border-r-transparent rotate-45 pointer-events-none"></div>
                          <div className="absolute bottom-0 right-4 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                        <div className="absolute bottom-0 text-center">
                          <div className="text-5xl font-serif text-slate-900 mb-1">87%</div>
                          <div className="text-sm text-slate-500">Growth Level</div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-auto pt-6">
                        <div className="text-center"><span className="font-medium text-slate-900">92</span> <span className="text-xs text-slate-500 ml-1">Max</span></div>
                        <div className="text-center"><span className="font-medium text-slate-900">72</span> <span className="text-xs text-slate-500 ml-1">Min</span></div>
                        <div className="text-center"><span className="font-medium text-slate-900">64</span> <span className="text-xs text-slate-500 ml-1">Avg</span></div>
                      </div>
                    </div>

                    {/* AI Assistant */}
                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden h-[450px]">
                      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-rose-100 via-orange-50 to-emerald-50 opacity-80 pointer-events-none"></div>
                      
                      <div className="relative z-10 flex justify-between items-center mb-6">
                        <h3 className="font-medium text-slate-800">AI Assistant</h3>
                        <MoreHorizontal className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
                      </div>
                      
                      <div className="relative z-10 flex-1 flex flex-col gap-4 overflow-y-auto pb-2" ref={chatContainerRef}>
                        {chatMessages.map((msg, idx) => (
                          <div key={idx} className={`text-sm p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'self-end bg-emerald-600 text-white rounded-tr-sm max-w-[90%]' : 'self-start bg-white border border-slate-100 text-slate-700 rounded-tl-sm w-full'}`}>
                            {msg.role === 'user' ? (
                              msg.content
                            ) : (
                              <div className="markdown-body prose prose-sm prose-emerald max-w-none">
                                <Markdown>{msg.content}</Markdown>
                              </div>
                            )}
                          </div>
                        ))}
                        {isChatLoading && (
                          <div className="self-start bg-white border border-slate-100 shadow-sm text-slate-700 text-sm p-4 rounded-2xl rounded-tl-sm w-full flex items-center gap-2">
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="relative z-10 mt-4 pt-2">
                        <form onSubmit={handleSendMessage} className="relative">
                          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 cursor-pointer" />
                          <input 
                            type="text" 
                            placeholder="Ask anything" 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isChatLoading}
                            className="w-full pl-12 pr-12 py-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm disabled:opacity-50" 
                          />
                          <button 
                            type="submit"
                            disabled={isChatLoading || !chatInput.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-200 transition-colors disabled:opacity-50"
                          >
                            <ArrowRight className="w-4 h-4 text-emerald-700" />
                          </button>
                        </form>
                        <p className="text-[10px] text-center text-slate-400 mt-3">AI Assistant can make mistakes. Please double check</p>
                      </div>
                    </div>

                  </div>

                </div>
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

                {/* Pump Schedule Section */}
                <div className="border-t border-slate-100 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-slate-800">Pump Schedule</h3>
                      <p className="text-xs text-slate-500">Automatically turn pump on/off</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDeviceSettings(prev => ({ ...prev, scheduleEnabled: prev.scheduleEnabled === 1 ? 0 : 1 }))}
                      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                        deviceSettings.scheduleEnabled === 1 ? 'bg-emerald-500' : 'bg-slate-300'
                      }`}
                    >
                      <span 
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          deviceSettings.scheduleEnabled === 1 ? 'translate-x-6' : 'translate-x-1'
                        }`} 
                      />
                    </button>
                  </div>

                  <AnimatePresence>
                    {deviceSettings.scheduleEnabled === 1 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4 overflow-hidden"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Turn ON Time</label>
                            <input 
                              type="time" 
                              value={minutesToTimeStr(deviceSettings.scheduleOnTime)}
                              onChange={(e) => setDeviceSettings(prev => ({ ...prev, scheduleOnTime: timeStrToMinutes(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-xs font-medium text-slate-500 mb-1">Turn OFF Time</label>
                            <input 
                              type="time" 
                              value={minutesToTimeStr(deviceSettings.scheduleOffTime)}
                              onChange={(e) => setDeviceSettings(prev => ({ ...prev, scheduleOffTime: timeStrToMinutes(e.target.value) }))}
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="pt-2">
                  <AnimatePresence>
                    {saveSuccessMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-4 p-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm border border-emerald-100 flex items-center gap-2"
                      >
                        <CheckCircle2 className="w-5 h-5" />
                        {saveSuccessMessage}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="submit"
                    disabled={isSavingSettings || !!saveSuccessMessage}
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
