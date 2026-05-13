'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase'; // Path check kar lena agar error aaye
import { Clock, Users, ArrowRight } from 'lucide-react';

export default function LiveTracker() {
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [waitingCount, setWaitingCount] = useState<number>(0);

  const fetchLiveStatus = async () => {
    // 1. Jo patient abhi cabin mein hai uska token nikalna
    const { data: cabinData, error: cabinError } = await supabase
      .from('bookings')
      .select('token_no')
      .eq('status', 'In Cabin')
      .limit(1)
      .single();

    if (cabinData) {
      setCurrentToken(cabinData.token_no);
    } else {
      setCurrentToken(null);
    }

    // 2. Bahar kitne log wait kar rahe hain wo ginna
    const { count, error: countError } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Waiting');

    if (count !== null) {
      setWaitingCount(count);
    }
  };

  // Jab page khule toh data laao, aur har 5 second mein auto-refresh karo!
  useEffect(() => {
    fetchLiveStatus();
    
    // Ye line har 5 second mein chup-chaap database se naya token le aayegi
    const interval = setInterval(() => {
      fetchLiveStatus();
    }, 5000); 

    // Jab patient page band kare toh interval rok do
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
      
      <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3">
          Apna<span className="text-blue-500">OPD</span> Live Status
        </h1>
        <p className="text-slate-400 font-medium text-lg flex items-center justify-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" /> Real-time Queue Tracking
        </p>
      </div>

      <div className="w-full max-w-2xl bg-slate-800 rounded-[40px] p-8 md:p-12 shadow-2xl border border-slate-700 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-500/20 blur-3xl"></div>

        <div className="text-center relative z-10">
          <h2 className="text-slate-400 uppercase tracking-[0.2em] font-bold text-sm md:text-base mb-6">
            Currently In Cabin
          </h2>
          
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl p-8 mb-8 shadow-inner flex items-center justify-center">
            {currentToken ? (
              <span className="text-7xl md:text-9xl font-black text-blue-500 tracking-tighter drop-shadow-lg">
                {currentToken}
              </span>
            ) : (
              <span className="text-4xl md:text-5xl font-bold text-slate-500 tracking-tight">
                Wait...
              </span>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 bg-slate-700/50 py-4 px-8 rounded-full inline-flex">
            <Users className="w-6 h-6 text-orange-400" />
            <span className="text-white font-bold text-xl md:text-2xl">
              {waitingCount} <span className="text-slate-400 font-medium text-lg md:text-xl">Patients Waiting</span>
            </span>
          </div>
        </div>
      </div>

      <p className="mt-12 text-slate-500 text-sm font-medium">
        Auto-refreshing every 5 seconds. Aap page refresh mat karein.
      </p>

    </div>
  );
}