import React from 'react';
import { Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, data?: any) => void;
  onOpenAuthModal?: (mode?: 'login' | 'signup', defaultRole?: 'patient' | 'doctor' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate, onOpenAuthModal }) => {
  return (
    <footer className="bg-white text-slate-600 border-t border-slate-200 pt-10 pb-6 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-8 border-b border-slate-100">
          {/* Column 1: Brand & Contact Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded bg-slate-50 border border-slate-100">
                <img 
                  src="/src/assets/images/medicare_hospital_brand_v1_1791047655537.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-lg font-bold tracking-tight text-slate-900">
                Medi<span className="text-sky-600">Care</span>
              </span>
            </div>

            <p className="text-slate-500 leading-relaxed text-xs">
              Find trusted doctors and book appointments online.
            </p>

            <div className="space-y-1.5 pt-1 text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>+92 (042) 111-CARE (2273)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>support@medicare.pk</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>Lahore, Karachi, Islamabad, Pakistan</span>
              </div>
            </div>

            {/* Professional Social Media Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href="#facebook"
                aria-label="Facebook"
                className="w-7 h-7 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 rounded flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="#twitter"
                aria-label="Twitter / X"
                className="w-7 h-7 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 rounded flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="#linkedin"
                aria-label="LinkedIn"
                className="w-7 h-7 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 rounded flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
              <a
                href="#youtube"
                aria-label="YouTube"
                className="w-7 h-7 bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 rounded flex items-center justify-center transition-colors"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('home')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search-doctors')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Find Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('specialties')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Specialties
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('clinics')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Clinics & Hospitals
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-sky-600 transition-colors"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: For Patients */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">For Patients</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onNavigate('search-doctors')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Find a Doctor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('search-doctors')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Book Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('patient-dashboard')}
                  className="hover:text-sky-600 transition-colors"
                >
                  My Appointments
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login', 'patient')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Patient Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('how-it-works')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Help Center
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: For Doctors */}
          <div>
            <h4 className="font-semibold text-slate-900 text-xs mb-3">For Doctors</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('signup', 'doctor')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Doctor Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => onOpenAuthModal && onOpenAuthModal('login', 'doctor')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Doctor Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctor-dashboard')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Doctor Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('doctor-dashboard')}
                  className="hover:text-sky-600 transition-colors"
                >
                  Manage Availability
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>© 2026 MediCare. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('how-it-works')} className="hover:text-slate-800">
              Privacy Policy
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onNavigate('how-it-works')} className="hover:text-slate-800">
              Terms & Conditions
            </button>
            <span className="text-slate-300">|</span>
            <button onClick={() => onNavigate('how-it-works')} className="hover:text-slate-800">
              Contact
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
