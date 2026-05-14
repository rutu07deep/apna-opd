'use client'; 
import React, { useState, useEffect } from 'react';
import { Search, Star, User, X, Clock, Heart, Stethoscope, Baby, Pill, CheckCircle, MapPin, Zap } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function MarketplaceHome() {
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Booking State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [bookingStep, setBookingStep] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase.from('doctors').select('*');
      if (data) setAllDoctors(data);
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = allDoctors.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || doc.speciality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All' || doc.speciality.toLowerCase().includes(activeCategory.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  const handleBookNow = (doc: any) => {
    setSelectedDoctor(doc);
    setBookingStep(1); 
    setSelectedSlot('');
    setIsModalOpen(true);
  };

  const handleConfirmBooking = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newToken = 'T-' + Math.floor(Math.random() * 90 + 10); 

    const { error } = await supabase.from('bookings').insert([{
      doctor_id: selectedDoctor.id,
      patient_name: patientName,
      patient_phone: patientPhone,
      token_no: newToken,
      slot_time: selectedSlot,
      status: 'Waiting'
    }]);

    setIsSubmitting(false);
    if (!error) {
      setGeneratedToken(newToken);
      setBookingStep(3); 
    } else {
      alert("System error. Try again.");
    }
  };

  const categories = [
    { name: 'All', icon: <Zap className="w-4 h-4"/> },
    { name: 'Cardiologist', icon: <Heart className="w-4 h-4"/> },
    { name: 'Dental', icon: <Stethoscope className="w-4 h-4"/> },
    { name: 'Pediatric', icon: <Baby className="w-4 h-4"/> },
    { name: 'General', icon: <Pill className="w-4 h-4"/> },
  ];

  return (
    <div className="min-h-screen bg-[#F4F4F5] font-sans text-slate-900 pb-24">
      {/* PREMIUM DARK HEADER */}
      <div className="bg-slate-900 text-white pb-20 rounded-b-[40px] shadow-lg relative">
        <nav className="px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="currentColor"/>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ApnaOPD</h1>
          </div>
          <div className="bg-slate-800 p-2.5 rounded-full cursor-pointer hover:bg-slate-700 transition"><User className="w-5 h-5 text-slate-300" /></div>
        </nav>

        <div className="px-6 pt-4">
          <p className="text-slate-400 font-medium mb-1">Book instantly. Zero waiting.</p>
          <h2 className="text-3xl font-extrabold mb-8 leading-tight">Find your <br/><span className="text-blue-400">Expert Doctor.</span></h2>
        </div>
      </div>

      {/* FLOATING SEARCH & FILTERS */}
      <div className="px-6 -mt-12 relative z-10">
        <div className="bg-white p-2 rounded-2xl shadow-xl shadow-slate-200/50 flex items-center mb-6 border border-slate-100">
          <div className="pl-3"><Search className="w-5 h-5 text-slate-400" /></div>
          <input 
            type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search doctors, symptoms..." 
            className="w-full bg-transparent p-3 focus:outline-none font-medium text-slate-800 placeholder-slate-400" 
          />
        </div>

        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {categories.map((cat, i) => (
            <button 
              key={i} onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${activeCategory === cat.name ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'}`}>
              {cat.icon} {cat.name === 'All' ? 'All Experts' : cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* DOCTOR LISTINGS */}
      <div className="px-6 mt-8 space-y-5">
        <div className="flex justify-between items-end mb-2">
          <h3 className="text-lg font-extrabold text-slate-900">Available Near You</h3>
          <span className="text-xs font-bold text-slate-500">{filteredDoctors.length} found</span>
        </div>
        
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border border-slate-200">
            <div className="animate-pulse flex flex-col items-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full mb-3"></div>
              <p className="text-slate-400 font-bold">Fetching doctors...</p>
            </div>
          </div>
        ) : (
          filteredDoctors.map((doc, i) => (
            <div key={i} className="bg-white p-5 rounded-[28px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
              {/* Live Status Badge */}
              <div className="absolute top-5 right-5 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Accepting Tokens</span>
              </div>

              <div className="flex gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center font-extrabold text-slate-500 text-2xl shadow-inner">
                  {doc.name.split(' ')[1]?.[0] || 'D'}
                </div>
                <div className="pt-1">
                  <h4 className="font-bold text-lg text-slate-900 leading-tight">{doc.name}</h4>
                  <p className="text-blue-600 text-sm font-semibold mb-1">{doc.speciality}</p>
                  <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                    <MapPin className="w-3 h-3" /> <span className="truncate max-w-[120px]">City Hospital Clinic</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-slate-50 mt-5 p-3 px-4 rounded-2xl border border-slate-100">
                <div>
                   <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consultation</p>
                   <p className="font-black text-slate-900">₹{doc.fees}</p>
                </div>
                <button 
                  onClick={() => handleBookNow(doc)}
                  className="bg-slate-900 hover:bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 flex items-center gap-2">
                  Get Token <ArrowRight className="w-4 h-4"/>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* MINIMALIST BOOKING MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-[32px] md:rounded-[32px] p-6 w-full max-w-md relative animate-in slide-in-from-bottom-8 duration-300 shadow-2xl">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-5 right-5 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition"><X className="w-5 h-5"/></button>
            
            {bookingStep === 1 && (
              <div className="pt-4">
                <div className="mb-6">
                  <h3 className="text-2xl font-extrabold text-slate-900">Select Slot</h3>
                  <p className="text-slate-500 font-medium">For {doc?.name || 'Doctor'}</p>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {selectedDoctor?.slots?.map((slot: string) => (
                    <button 
                      key={slot} onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${selectedSlot === slot ? 'bg-blue-50 text-blue-600 border-blue-600 shadow-sm' : 'bg-white text-slate-600 border-slate-100 hover:border-slate-300'}`}>
                      {slot}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={!selectedSlot} onClick={() => setBookingStep(2)}
                  className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${selectedSlot ? 'bg-slate-900 text-white shadow-lg active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div className="pt-4">
                <h3 className="text-2xl font-extrabold text-slate-900 mb-1">Your Details</h3>
                <p className="text-slate-500 font-medium mb-6 flex items-center gap-1"><Clock className="w-4 h-4"/> Selected Slot: <span className="text-slate-900 font-bold">{selectedSlot}</span></p>

                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <input 
                    type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Full Name (e.g. Aman)" 
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium placeholder-slate-400"
                  />
                  <input 
                    type="tel" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="WhatsApp Number" pattern="[0-9]{10}"
                    className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 font-medium placeholder-slate-400"
                  />
                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-600/20 mt-6 active:scale-95 transition-all">
                    {isSubmitting ? 'Generating Token...' : 'Confirm & Generate Token'}
                  </button>
                </form>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-1">Token Generated!</h3>
                <p className="text-slate-500 font-medium mb-6">Show this at the clinic reception.</p>
                
                <div className="bg-slate-900 rounded-[24px] p-6 mb-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-xl"></div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Your Token No.</p>
                  <p className="text-5xl font-black text-white tracking-tighter mb-4">{generatedToken}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800 text-left">
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Time</p>
                      <p className="text-sm text-slate-200 font-bold">{selectedSlot}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Doctor</p>
                      <p className="text-sm text-slate-200 font-bold">{selectedDoctor?.name.split(' ')[1]}</p>
                    </div>
                  </div>
                </div>

                <button onClick={() => {setIsModalOpen(false); setBookingStep(1);}} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold py-4 rounded-2xl transition-all">
                  Back to Home
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}