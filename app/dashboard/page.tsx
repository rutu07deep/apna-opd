'use client';
import React, { useState } from 'react';
import { Users, CheckCircle, Clock, Bell, ArrowRight, UserCheck } from 'lucide-react';

export default function ReceptionistDashboard() {
  // Dummy data (Baad me ye Supabase se aayega)
  const [patients, setPatients] = useState([
    { id: 1, token: 'T-01', name: 'Rahul Kumar', phone: '9876543210', slot: '10:00 AM', status: 'In Cabin' },
    { id: 2, token: 'T-02', name: 'Priya Singh', phone: '9876543211', slot: '10:15 AM', status: 'Waiting' },
    { id: 3, token: 'T-03', name: 'Amit Verma', phone: '9876543212', slot: '10:30 AM', status: 'Waiting' },
    { id: 4, token: 'T-04', name: 'Neha Sharma', phone: '9876543213', slot: '10:45 AM', status: 'Waiting' },
  ]);

  // Status update function (Frontend visual test)
  const updateStatus = (id: number, newStatus: string) => {
    setPatients(patients.map(p => p.id === id ? { ...p, status: newStatus } : p));
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
          <p className="text-slate-400 text-sm font-medium">Dr. Sharma's Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-800 p-3 rounded-full relative cursor-pointer">
            <Bell className="w-5 h-5 text-slate-300" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-900"></span>
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
              <div className="text-center">
                <div className="text-6xl font-black text-blue-600 mb-2 tracking-tighter">{inCabinPatient.token}</div>
                <h3 className="text-2xl font-bold text-slate-900">{inCabinPatient.name}</h3>
                <p className="text-slate-500 font-medium mt-1">{inCabinPatient.slot}</p>
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
              <span className="text-3xl font-black text-slate-900">{patients.filter(p => p.status === 'Completed').length}</span>
              <span className="text-xs font-bold text-slate-400 uppercase mt-1">Done Today</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: QUEUE LIST */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-extrabold text-slate-900">Waiting Queue</h2>
            <button className="text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors">
              Refresh List
            </button>
          </div>

          <div className="space-y-4">
            {patients.filter(p => p.status === 'Waiting').map((patient, index) => (
              <div key={patient.id} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 hover:border-blue-200 hover:shadow-md transition-all bg-slate-50">
                <div className="flex items-center gap-6">
                  <div className="bg-white w-16 h-16 rounded-xl flex items-center justify-center border border-slate-200 shadow-sm text-xl font-black text-slate-800">
                    {patient.token}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{patient.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {patient.slot}
                      </span>
                      <span className="text-sm font-medium text-slate-500">Phone: {patient.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Call Next Action */}
                {index === 0 && !inCabinPatient ? (
                   <button 
                    onClick={() => updateStatus(patient.id, 'In Cabin')}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-blue-200 flex items-center gap-2 transition-all">
                    Call Next <ArrowRight className="w-4 h-4" />
                   </button>
                ) : (
                  <button className="bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-all">
                    <UserCheck className="w-4 h-4" /> Mark Arrived
                  </button>
                )}
              </div>
            ))}

            {waitingCount === 0 && (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl">
                <p className="text-slate-500 font-bold text-lg">Queue is empty!</p>
                <p className="text-slate-400 text-sm mt-1">All patients have been checked.</p>
              </div>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}