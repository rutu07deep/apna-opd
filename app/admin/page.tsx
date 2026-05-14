'use client';
import React, { useState, useEffect } from 'react';
import { UserPlus, Stethoscope, IndianRupee, Clock, LayoutDashboard, CheckCircle, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [docName, setDocName] = useState('');
  const [speciality, setSpeciality] = useState('');
  const [fees, setFees] = useState('');
  const [slotsText, setSlotsText] = useState(''); // Comma separated slots

  // 1. FETCH ALL DOCTORS
  const fetchDoctors = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('doctors').select('*').order('created_at', { ascending: false });
    if (data) setDoctors(data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // 2. ADD NEW DOCTOR TO SUPABASE
  const handleAddDoctor = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Convert comma-separated string to array: "10:00 AM, 10:30 AM" -> ["10:00 AM", "10:30 AM"]
    const slotsArray = slotsText.split(',').map(slot => slot.trim()).filter(slot => slot !== '');

    const { error } = await supabase.from('doctors').insert([
      {
        name: docName.startsWith('Dr.') ? docName : `Dr. ${docName}`,
        speciality: speciality,
        fees: parseInt(fees),
        slots: slotsArray
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      alert("Error adding doctor! Check console.");
      console.error(error);
    } else {
      alert("Doctor Added Successfully! 🎉");
      // Form clear karo
      setDocName(''); setSpeciality(''); setFees(''); setSlotsText('');
      fetchDoctors(); // List refresh karo
    }
  };

  // 3. DELETE DOCTOR (Bonus Feature)
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this doctor?")) {
      await supabase.from('doctors').delete().eq('id', id);
      fetchDoctors();
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-sans">
      {/* HEADER */}
      <header className="bg-slate-900 text-white px-8 py-5 flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><LayoutDashboard className="w-5 h-5 text-white" /></div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">ApnaOPD Admin</h1>
            <p className="text-blue-400 text-xs font-bold uppercase tracking-widest">Clinic Owner Panel</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: ADD DOCTOR FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[32px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100">
            <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-lg font-extrabold text-slate-900">Add New Doctor</h2>
            </div>

            <form onSubmit={handleAddDoctor} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Doctor Name</label>
                <input 
                  type="text" required value={docName} onChange={(e) => setDocName(e.target.value)}
                  placeholder="e.g. Arvind Sharma" 
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Speciality</label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <select 
                    required value={speciality} onChange={(e) => setSpeciality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700 appearance-none">
                    <option value="" disabled>Select Speciality</option>
                    <option value="Cardiologist">Cardiologist</option>
                    <option value="Dental">Dental</option>
                    <option value="Pediatric">Pediatric (Kids)</option>
                    <option value="General Physician">General Physician</option>
                    <option value="Orthopedic">Orthopedic</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Consultation Fees (₹)</label>
                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="number" required value={fees} onChange={(e) => setFees(e.target.value)}
                    placeholder="e.g. 500" 
                    className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Available Slots</label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <input 
                    type="text" required value={slotsText} onChange={(e) => setSlotsText(e.target.value)}
                    placeholder="10:00 AM, 10:30 AM, 11:00 AM" 
                    className="w-full bg-slate-50 border border-slate-200 p-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">Separate multiple slots with commas.</p>
              </div>

              <button 
                type="submit" disabled={isSubmitting} 
                className="w-full bg-slate-900 hover:bg-black text-white font-bold py-3.5 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 transition-all active:scale-95">
                {isSubmitting ? 'Adding...' : <><CheckCircle className="w-5 h-5"/> Save Doctor Data</>}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: LIST OF DOCTORS */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6 lg:p-8">
            <h2 className="text-xl font-extrabold text-slate-900 mb-6">Manage Doctors Database</h2>

            <div className="space-y-4">
              {isLoading ? (
                 <p className="text-center text-slate-400 font-medium py-10">Fetching from database...</p>
              ) : doctors.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 font-bold">No doctors found in database.</p>
                  <p className="text-slate-400 text-sm mt-1">Add a doctor using the form on the left.</p>
                </div>
              ) : (
                doctors.map((doc) => (
                  <div key={doc.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center border border-blue-200 shadow-sm text-xl font-black text-blue-600">
                        {doc.name.split(' ')[1]?.[0] || 'D'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{doc.name}</h3>
                        <p className="text-sm font-semibold text-blue-600">{doc.speciality}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {doc.slots?.map((slot: string, i: number) => (
                            <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-md">{slot}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:flex-col md:items-end gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-right">
                         <span className="text-[10px] font-bold text-slate-400 uppercase">Fees</span>
                         <p className="font-black text-slate-900">₹{doc.fees}</p>
                      </div>
                      <button 
                        onClick={() => handleDelete(doc.id)}
                        className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}