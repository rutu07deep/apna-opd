'use client';
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Bell, ArrowRight, UserCheck, Activity, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function LiveDashboard() {
  const [queue, setQueue] = useState<any[]>([]);
  const [currentPatient, setCurrentPatient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. DATA LAANA AUR LIVE SYNC ON KARNA
  useEffect(() => {
    fetchLiveQueue();

    // SUPABASE REALTIME MAGIC (Auto-Refresh)
    const channel = supabase
      .channel('live-queue')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, (payload) => {
        fetchLiveQueue(); // Kuch bhi change ho, turant refresh maar do
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchLiveQueue = async () => {
    setIsLoading(true);
    // 'In Cabin' wale patient ko dhoondho
    const { data: cabinData } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'In Cabin')
      .limit(1);
    
    if (cabinData && cabinData.length > 0) {
      setCurrentPatient(cabinData[0]);
    } else {
      setCurrentPatient(null);
    }

    // 'Waiting' walo ki line lagao (Purane sabse upar)
    const { data: waitingData } = await supabase
      .from('bookings')
      .select('*')
      .eq('status', 'Waiting')
      .order('created_at', { ascending: true });
    
    if (waitingData) setQueue(waitingData);
    setIsLoading(false);
  };

  // 2. CALL NEXT PATIENT BUTTON
  const callNextPatient = async () => {
    if (queue.length === 0) return alert("Queue khali hai!");

    const nextPatient = queue[0]; // Line ka pehla banda

    // Agar pehle se koi andar hai, toh usko 'Done' karo
    if (currentPatient) {
      await supabase.from('bookings').update({ status: 'Done' }).eq('id', currentPatient.id);
    }

    // Naye bande ko 'In Cabin' karo
    await supabase.from('bookings').update({ status: 'In Cabin' }).eq('id', nextPatient.id);
    
    fetchLiveQueue(); // Screen update
  };

  // 3. COMPLETE CHECKUP BUTTON
  const markAsDone = async () => {
    if (!currentPatient) return;
    await supabase.from('bookings').update({ status: 'Done' }).eq('id', currentPatient.id);
    setCurrentPatient(null);
    fetchLiveQueue();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      {/* PREMIUM HEADER */}
      <nav className="bg-slate-900 px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-inner">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight leading-tight">Clinic Control</h1>
            <p className="text-xs font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Live Sync On
            </p>
          </div>
        </div>
        <div className="bg-slate-800 p-2.5 rounded-full"><Bell className="w-5 h-5 text-slate-300" /></div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: CURRENT PATIENT (CABIN) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Current Patient (In Cabin)</h2>
            
            {currentPatient ? (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <p className="text-7xl font-black text-slate-900 tracking-tighter mb-2">{currentPatient.token_no}</p>
                  <p className="text-2xl font-bold text-blue-600">{currentPatient.patient_name}</p>
                  <p className="text-slate-500 font-medium flex items-center gap-2 mt-2"><Clock className="w-4 h-4"/> Slot: {currentPatient.slot_time}</p>
                </div>
                <button 
                  onClick={markAsDone}
                  className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all h-fit">
                  <CheckCircle className="w-6 h-6"/> Complete Checkup
                </button>
              </div>
            ) : (
              <div className="py-12 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserCheck className="w-10 h-10 text-slate-300" />
                </div>
                <p className="text-2xl font-bold text-slate-400">Cabin is Empty</p>
                <p className="text-slate-400 font-medium mt-1">Call the next patient from the queue.</p>
              </div>
            )}
          </div>

          {/* CALL NEXT BUTTON */}
          <button 
            onClick={callNextPatient}
            disabled={queue.length === 0}
            className={`w-full py-5 rounded-[24px] font-black text-xl flex items-center justify-center gap-3 transition-all shadow-xl ${queue.length > 0 ? 'bg-slate-900 text-white hover:bg-black active:scale-[0.98]' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
            Call Next Patient <ArrowRight className="w-6 h-6"/>
          </button>
        </div>

        {/* RIGHT COLUMN: WAITING QUEUE */}
        <div className="bg-white rounded-[32px] p-6 shadow-lg border border-slate-100 flex flex-col max-h-[80vh]">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600"/> Waiting Queue
            </h2>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-black">{queue.length} Wait</span>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
            {isLoading ? (
              <p className="text-center text-slate-400 font-medium py-10">Syncing...</p>
            ) : queue.length === 0 ? (
              <p className="text-center text-slate-400 font-bold py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">No patients waiting</p>
            ) : (
              queue.map((patient, index) => (
                <div key={patient.id} className="bg-slate-50 hover:bg-slate-100 p-4 rounded-2xl border border-slate-100 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center font-black text-slate-900 border border-slate-200">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{patient.patient_name}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase">{patient.token_no}</p>
                    </div>
                  </div>
                  <div className="text-right">
                     <p className="text-xs text-slate-400 font-bold">{patient.slot_time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}