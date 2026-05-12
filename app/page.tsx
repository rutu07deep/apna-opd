'use client'; 
import React, { useState, useEffect } from 'react';
import { Search, Star, ArrowRight, User, X, Clock, Heart, Stethoscope, Baby, Pill, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase'; // Database Bridge

export default function MarketplaceHome() {
  const [allDoctors, setAllDoctors] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [bookingStep, setBookingStep] = useState(1);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. SUPABASE SE DOCTORS LAANA
  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase.from('doctors').select('*');
      if (data) setAllDoctors(data);
    };
    fetchDoctors();
  }, []);

  const filteredDoctors = allDoctors.filter(doc => 
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doc.speciality.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleBookNow = (doc: any) => {
    setSelectedDoctor(doc);
    setBookingStep(1); 
    setSelectedSlot('');
    setIsModalOpen(true);
  };

  // 2. SUPABASE MEIN BOOKING SAVE KARNA
  const handleConfirmBooking = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newToken = 'T-' + Math.floor(Math.random() * 100); // Random Token

    const { error } = await supabase
      .from('bookings')
      .insert([
        {
          doctor_id: selectedDoctor.id,
          patient_name: patientName,
          patient_phone: patientPhone,
          token_no: newToken,
          slot_time: selectedSlot,
          status: 'Waiting'
        }
      ]);

    setIsSubmitting(false);

    if (!error) {
      setGeneratedToken(newToken);
      setBookingStep(3); // Success screen
    } else {
      alert("Booking fail ho gayi bhai, console check kar.");
      console.error(error);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setPatientName('');
    setPatientPhone('');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <nav className="bg-white px-6 py-4 flex justify-between items-center border-b sticky top-0 z-40 shadow-sm">
        <h1 className="text-2xl font-extrabold text-blue-600 tracking-tight">ApnaOPD</h1>
        <div className="bg-slate-100 p-2 rounded-full cursor-pointer hover:bg-slate-200"><User className="w-5 h-5 text-slate-600" /></div>
      </nav>

      <section className="px-6 py-8 bg-white rounded-b-[40px] shadow-sm">
        <h2 className="text-3xl font-extrabold text-slate-900 mb-6 leading-tight">
          Find your <span className="text-blue-600">Expert Doctor.</span>
        </h2>
        
        <div className="flex items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mb-6 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Doctor or Speciality..." 
            className="bg-transparent focus:outline-none w-full text-slate-800 font-medium" 
          />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {[
            { name: 'Heart', icon: <Heart className="w-5 h-5"/>, color: 'bg-red-50 text-red-500' },
            { name: 'Dental', icon: <Stethoscope className="w-5 h-5"/>, color: 'bg-blue-50 text-blue-500' },
            { name: 'Kids', icon: <Baby className="w-5 h-5"/>, color: 'bg-orange-50 text-orange-500' },
            { name: 'Medicine', icon: <Pill className="w-5 h-5"/>, color: 'bg-green-50 text-green-500' },
          ].map((cat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer hover:opacity-80 transition-opacity">
              <div className={`${cat.color} p-4 rounded-2xl shadow-sm`}>{cat.icon}</div>
              <span className="text-xs font-bold text-slate-600">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-8 space-y-6 pb-24">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-800">Available Doctors</h3>
        </div>
        
        {filteredDoctors.length === 0 ? (
          <p className="text-slate-500">Loading doctors...</p>
        ) : (
          filteredDoctors.map((doc, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div className="flex gap-4">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center font-bold text-blue-500 text-xl border border-blue-100">
                    {doc.name.split(' ')[1][0]}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{doc.name}</h4>
                    <p className="text-blue-600 text-sm font-semibold">{doc.speciality}</p>
                  </div>
                </div>
                <div className="bg-green-50 px-2 py-1 rounded-lg flex items-center border border-green-100">
                  <Star className="w-3 h-3 text-green-600 fill-current mr-1" />
                  <span className="text-green-700 font-bold text-xs">4.8</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-4 mt-2">
                <div className="flex flex-col">
                   <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Consultation</span>
                   <span className="font-extrabold text-slate-900">₹{doc.fees}</span>
                </div>
                <button 
                  onClick={() => handleBookNow(doc)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl text-sm font-bold shadow-md shadow-blue-200 transition-all">
                  Book Now
                </button>
              </div>
            </div>
          ))
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 z-50">
          <div className="bg-white rounded-t-[40px] md:rounded-[40px] p-8 w-full max-w-md relative animate-in slide-in-from-bottom duration-300">
            <button onClick={closeModal} className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors"><X className="w-5 h-5"/></button>
            
            {bookingStep === 1 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Select Time Slot</h3>
                <p className="text-slate-500 mb-6 font-medium">Dr. {selectedDoctor?.name.split(' ')[1]}</p>

                <div className="grid grid-cols-3 gap-3 mb-8">
                  {selectedDoctor?.slots.map((slot: string) => (
                    <button 
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-3 rounded-2xl font-bold text-sm transition-all border ${selectedSlot === slot ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>

                <button 
                  disabled={!selectedSlot}
                  onClick={() => setBookingStep(2)}
                  className={`w-full font-bold py-4 rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all ${selectedSlot ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
                  Next: Patient Details <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            )}

            {bookingStep === 2 && (
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">Patient Details</h3>
                <p className="text-slate-500 mb-6 font-medium">Slot: <span className="text-blue-600">{selectedSlot}</span></p>

                <form onSubmit={handleConfirmBooking} className="space-y-4 mb-2">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                    <input 
                      type="text" required value={patientName} onChange={(e) => setPatientName(e.target.value)}
                      placeholder="e.g. Rahul Kumar" 
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">WhatsApp Number</label>
                    <input 
                      type="tel" required value={patientPhone} onChange={(e) => setPatientPhone(e.target.value)}
                      placeholder="10-digit number" pattern="[0-9]{10}"
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  
                  <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 mt-4 flex items-center justify-center gap-2 transition-all">
                    {isSubmitting ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </form>
                <button onClick={() => setBookingStep(1)} className="w-full mt-2 text-slate-500 font-bold py-2 text-sm hover:text-slate-700">Go Back</button>
              </div>
            )}

            {bookingStep === 3 && (
              <div className="text-center py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-3xl font-extrabold text-slate-900 mb-2">Confirmed!</h3>
                <p className="text-slate-500 font-medium mb-8">Your appointment is booked.</p>
                
                <div className="bg-slate-50 border border-slate-100 rounded-3xl p-6 mb-8 shadow-inner">
                  <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mb-2">Your Token</p>
                  <p className="text-4xl font-extrabold text-blue-600 tracking-tight">#{generatedToken}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between text-sm">
                    <span className="text-slate-500 font-medium">{selectedSlot}</span>
                    <span className="text-slate-900 font-bold">{selectedDoctor?.name}</span>
                  </div>
                </div>

                <button onClick={closeModal} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl shadow-lg transition-all">
                  Done
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}