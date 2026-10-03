import React, { useState } from 'react';
import { Specialty, City, Doctor, Review } from '../../types';
import { HERO_IMAGE } from '../../lib/mockData';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Star, 
  ShieldCheck, 
  Building2, 
  ChevronRight,
  Stethoscope,
  Clock,
  CheckCircle2,
  ChevronDown,
  HelpCircle
} from 'lucide-react';

interface HomePageProps {
  specialties: Specialty[];
  cities: City[];
  featuredDoctors: Doctor[];
  reviews: Review[];
  onNavigate: (view: string, data?: any) => void;
  onOpenBooking: (doctor: Doctor) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  specialties,
  cities,
  featuredDoctors,
  reviews,
  onNavigate,
  onOpenBooking,
}) => {
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNavigate('search-doctors', {
      specialtyId: selectedSpecialty || undefined,
      cityId: selectedCity || undefined,
      searchQuery: searchQuery || undefined,
    });
  };

  const faqs = [
    {
      q: 'How do I book a doctor appointment on MediCare?',
      a: 'Search for your required specialist or city, choose an available time slot from the doctor’s schedule, enter your contact information, and receive your instant confirmation token. No advance payment is needed.'
    },
    {
      q: 'Do I need to pay online when booking an appointment?',
      a: 'No. MediCare does not charge any online booking fees. Your consultation fee is payable directly at the hospital or clinic reception desk upon arrival.'
    },
    {
      q: 'Are the doctors on MediCare verified?',
      a: 'Yes, all practicing physicians and surgeons listed on MediCare are verified with PMDC / medical registration numbers and hospital affiliations.'
    },
    {
      q: 'Can I cancel or reschedule my appointment?',
      a: 'Yes, you can easily cancel or reschedule your visit from your Patient Dashboard at any time prior to the consultation.'
    }
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* 1. Professional Medical Hero Section */}
      <section className="bg-slate-900 text-white relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <img
            src={HERO_IMAGE}
            alt="Medical Clinic Consultation"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-1.5 border border-white/20 backdrop-blur-sm">
                <img 
                  src="/src/assets/images/medicare_hospital_brand_v1_1791047655537.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="h-8 w-px bg-white/20"></div>
              <div className="text-xl font-bold tracking-tight">MediCare</div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-3">
              Find Best Doctors & Book Appointments in Pakistan
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              Book confirmed in-person clinic appointments and video consultations with qualified specialists at top hospitals.
            </p>

            {/* 2. "Find a Doctor" Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="bg-white text-slate-800 p-3 rounded shadow-lg border border-slate-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* Doctor or Condition Search */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                    Doctor or Specialty
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g. Cardiologist, Dr. Tariq..."
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
                    />
                  </div>
                </div>

                {/* City Selection */}
                <div>
                  <label className="block text-[10px] font-semibold text-slate-600 uppercase mb-1">
                    City / Location
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
                  >
                    <option value="">All Cities (Lahore, Karachi...)</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Search Button */}
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-semibold py-1.5 px-3 rounded text-xs transition-colors flex items-center justify-center gap-1.5 h-[34px]"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Search Doctors</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* 3. Popular Specialties */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Popular Specialties</h2>
            <p className="text-xs text-slate-500">Consult top-rated specialist doctors for your health concerns.</p>
          </div>
          <button
            onClick={() => onNavigate('specialties')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
          >
            <span>All Specialties</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {specialties.slice(0, 8).map((spec) => (
            <button
              key={spec.id}
              onClick={() => onNavigate('search-doctors', { specialtyId: spec.id })}
              className="p-3 bg-white border border-slate-200 rounded hover:border-sky-500 hover:bg-slate-50/50 transition-colors text-left flex items-start gap-2.5 group"
            >
              <div className="w-8 h-8 bg-sky-50 text-sky-700 rounded flex items-center justify-center shrink-0 group-hover:bg-sky-600 group-hover:text-white transition-colors">
                <Stethoscope className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-700">
                  {spec.name}
                </h3>
                <p className="text-[11px] text-slate-500 truncate">
                  {spec.doctorCount}+ Doctors
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Featured / Verified Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Featured & Verified Doctors</h2>
            <p className="text-xs text-slate-500">Certified consultants with high patient satisfaction ratings.</p>
          </div>
          <button
            onClick={() => onNavigate('search-doctors')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredDoctors.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              {/* Doctor Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <img
                    src={doc.avatarUrl}
                    alt={doc.fullName}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200">
                        {doc.specialtyName}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                      {doc.fullName}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate">
                      {doc.qualifications[0]}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium">
                      {doc.experienceYears} Yrs Exp. · {doc.cityName}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-xs space-y-1 text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{doc.clinicName}</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1 text-xs">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="font-bold text-slate-900">{doc.rating.toFixed(2)}</span>
                      <span className="text-slate-400 text-[11px]">({doc.reviewCount})</span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block leading-none">Fee</span>
                      <span className="text-xs font-bold text-slate-900 font-mono">
                        Rs. {doc.consultationFee.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  onClick={() => onNavigate('doctor-profile', { doctorId: doc.id })}
                  className="py-1.5 px-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onOpenBooking(doc)}
                  className="py-1.5 px-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded text-center transition-colors"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. How Appointment Booking Works — 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded p-6">
          <div className="text-center max-w-lg mx-auto mb-6">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">How Appointment Booking Works</h2>
            <p className="text-xs text-slate-500">Book your clinic appointment in 3 easy steps with zero booking fees.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded border border-slate-200 text-center">
              <div className="w-8 h-8 bg-sky-600 text-white font-bold rounded flex items-center justify-center mx-auto mb-2 text-xs">
                1
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Search Specialist Doctor</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Filter by specialty, city, hospital, and consultation fee.
              </p>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 text-center">
              <div className="w-8 h-8 bg-sky-600 text-white font-bold rounded flex items-center justify-center mx-auto mb-2 text-xs">
                2
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Select Date & Time Slot</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Choose an available slot from the doctor’s schedule.
              </p>
            </div>

            <div className="bg-white p-4 rounded border border-slate-200 text-center">
              <div className="w-8 h-8 bg-sky-600 text-white font-bold rounded flex items-center justify-center mx-auto mb-2 text-xs">
                3
              </div>
              <h3 className="text-xs font-bold text-slate-900 mb-1">Visit Clinic & Pay at Desk</h3>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Get your instant token pass and pay fee at clinic check-in.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Trusted Clinics & Hospitals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Partner Hospitals & Clinics</h2>
            <p className="text-xs text-slate-500">Consult with doctors practicing at renowned medical centers.</p>
          </div>
          <button
            onClick={() => onNavigate('clinics')}
            className="text-xs font-semibold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
          >
            <span>View All Clinics</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-1">
            <h3 className="font-bold text-slate-900">Doctors Hospital & Medical Center</h3>
            <p className="text-slate-500 text-[11px]">Canal Bank Road, Johar Town, Lahore</p>
            <span className="text-[11px] text-sky-700 font-semibold block pt-1">OPD: 09:00 AM - 09:00 PM</span>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-1">
            <h3 className="font-bold text-slate-900">Aga Khan University Hospital Clinics</h3>
            <p className="text-slate-500 text-[11px]">Stadium Road, Karachi</p>
            <span className="text-[11px] text-sky-700 font-semibold block pt-1">OPD: 08:30 AM - 08:00 PM</span>
          </div>

          <div className="bg-white p-4 rounded border border-slate-200 text-xs space-y-1">
            <h3 className="font-bold text-slate-900">Shifa International Hospital</h3>
            <p className="text-slate-500 text-[11px]">Sector H-8/4, Islamabad</p>
            <span className="text-[11px] text-sky-700 font-semibold block pt-1">OPD: 08:00 AM - 09:00 PM</span>
          </div>
        </div>
      </section>

      {/* 7. Patient Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 pb-2 border-b border-slate-200">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Patient Feedback</h2>
          <p className="text-xs text-slate-500">Verified reviews from patients who booked through MediCare.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.slice(0, 3).map((rev) => (
            <div key={rev.id} className="bg-white p-4 rounded border border-slate-200 text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-0.5 text-amber-500 mb-1.5">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                  ))}
                </div>
                <p className="text-slate-700 italic leading-relaxed mb-3 text-[11px]">
                  "{rev.comment}"
                </p>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-900">{rev.patientName}</span>
                <span>{rev.visitReason}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. FAQ Accordion */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-5 rounded border border-slate-200">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-sky-600" />
            <span>Frequently Asked Questions</span>
          </h2>

          <div className="space-y-2 text-xs">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="border border-slate-200 rounded overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left p-3 bg-slate-50/70 hover:bg-slate-50 font-semibold text-slate-800 flex items-center justify-between gap-2"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-3 bg-white text-slate-600 text-[11px] leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. Strong Appointment CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-sky-600 text-white rounded p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold">Need to consult a doctor today?</h3>
            <p className="text-xs text-sky-100 mt-0.5">
              Browse specialist schedules in Lahore, Karachi, and Islamabad with immediate booking.
            </p>
          </div>

          <button
            onClick={() => onNavigate('search-doctors')}
            className="px-5 py-2.5 bg-white hover:bg-slate-100 text-sky-700 font-bold text-xs rounded transition-colors whitespace-nowrap shadow-xs"
          >
            Find Doctor & Book Now
          </button>
        </div>
      </section>
    </div>
  );
};
