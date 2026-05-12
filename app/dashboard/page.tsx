'use client';
import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, Clock, Bell, ArrowRight, UserCheck, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase'; // Database Bridge (Path check kar lena agar error aaye)

export default function ReceptionistDashboard() {
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. SUPABASE SE ASLI BOOKINGS LAANA
  const fetchBookings = async () => {
    setIsLoading(true);
    // Sirf wo bookings laayenge jo 'Completed' nahi hain (Waiting ya In Cabin)
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .neq('status', 'Completed')
      .order('created_at', { ascending: true }); // Jo pehle aaya, wo upar dikhega

    if (data) {
      setPatients(data);
    } else {
      console.error(error);
    }
    setIsLoading(false);
  };

  // Jab page khule, tab data fetch karo
  useEffect(() => {
    fetchBookings();
  }, []);

  // 2. SUPABASE MEIN STATUS UPDATE KARNA
  const updateStatus = async (id: string, newStatus: string) => {
    // Pehle frontend mein update dikhao (taaki fast lage)
    setPatients(patients.map(p => p.id === id ? { ...p, status: newStatus } : p));

    // Phir database mein update karo
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      alert("Status update nahi hua, check console!");
      console.error(error);
      fetchBookings(); // Agar error aaye toh purana data wapas laao
    }
  };

  // Stats calculate karna
  const waitingCount = patients.filter(p => p.status === 'Waiting').length;
  const inCabinPatient = patients.find(p => p.status === 'In Cabin');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-8 py-4 flex justify-between items-center shadow-md">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Clinic Control</h1>
          <p className="text-slate-400 text-sm font-medium">Live Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-full relative cursor-pointer">
            <Bell className="w-5 h-5 text-slate-300" />
            {waitingCount > 0 && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
            )}
          </div>
          <div className="flex items-center gap-3 bg-slate-800 px-4 py-2 rounded-full cursor-pointer">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center font-bold">R</div>
            <span className="font-semibold text-sm">Reception</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: LIVE ACTION */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* IN CABIN CARD */}
          <div className="bg-white rounded-[32px] p-8 border border-blue-100 shadow-xl shadow-blue-50 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Current Patient (In Cabin)</h2>
            
            {inCabinPatient ? (
              <div className="text-center animate-in fade-in duration-300">
                <div className="text-6xl font-black text-blue-600 mb-2 tracking-tighter">#{inCabinPatient.token_no}</div>
                <h3 className="text-2xl font-bold text-slate-900">{inCabinPatient.patient_name}</h3>
                <p className="text-slate-500 font-medium mt-1">{inCabinPatient.slot_time}</p>
                <button 
                  onClick={() => updateStatus(inCabinPatient.id, 'Completed')}
                  className="w-full mt-8 bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-200 transition-all flex justify-center items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Mark Completed
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400 font-medium">No patient currently in cabin.</p>
              </div>
            )}
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-orange-500 mb-2" />
              <span className="text-3xl font-black text-slate-900">{waitingCount}</span>
              <span className="text-xs font-bold text-slate-400 uppercase mt-1">Waiting</span>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
              <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
              <span className="text-3xl font-black text-slate-900">Live</span>
              <span className="text-xs font-bold text-slate-400 uppercase mt-1">Sync</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUEUE LIST */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">Waiting Queue</h2>
            <button 
              onClick={fetchBookings}
              className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2">
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh List
            </button>
          </div>

          <div className="space-y-4">
            {isLoading ? (
               <p className="text-center text-slate-400 py-8">Loading queue...</p>
            ) : patients.filter(p => p.status === 'Waiting').length > 0 ? (
              patients.filter(p => p.status === 'Waiting').map((patient, index) => (
                <div key={patient.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50 animate-in slide-in-from-right duration-300">
                  <div className="flex items-center gap-6">
                    <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-xl font-black text-slate-800">
                      {patient.token_no}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{patient.patient_name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                          <Clock className="w-4 h-4" /> {patient.slot_time}
                        </span>
                        <span className="text-sm font-medium text-slate-500">📞 {patient.patient_phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Call Next Action */}
                  {index === 0 && !inCabinPatient && (
                    <button 
                      onClick={() => updateStatus(patient.id, 'In Cabin')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition-all">
                      Call Next <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-bold text-lg">Queue is empty!</p>
                <p className="text-slate-400 text-sm mt-1">Sare patients check ho gaye.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}