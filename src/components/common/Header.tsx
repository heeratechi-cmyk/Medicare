import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  Calendar, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Stethoscope, 
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenAuthModal: (mode?: 'login' | 'signup', defaultRole?: 'patient' | 'doctor' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onNavigate, onOpenAuthModal }) => {
  const { user, role, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo on Left */}
          <div className="flex items-center gap-8">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2 text-left focus:outline-none group"
            >
              <div className="w-10 h-10 flex items-center justify-center overflow-hidden rounded-lg bg-slate-50 border border-slate-100 group-hover:border-sky-200 transition-all">
                <img 
                  src="/src/assets/images/medicare_hospital_brand_v1_1791047655537.jpg" 
                  alt="MediCare Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Medi<span className="text-sky-600">Care</span>
              </span>
            </button>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-700">
              <button
                onClick={() => onNavigate('home')}
                className={`transition-colors hover:text-sky-600 ${
                  currentView === 'home' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Home
              </button>
              <button
                onClick={() => onNavigate('search-doctors')}
                className={`transition-colors hover:text-sky-600 ${
                  currentView === 'search-doctors' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Find Doctors
              </button>
              <button
                onClick={() => onNavigate('specialties')}
                className={`transition-colors hover:text-sky-600 ${
                  currentView === 'specialties' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Specialties
              </button>
              <button
                onClick={() => onNavigate('clinics')}
                className={`transition-colors hover:text-sky-600 ${
                  currentView === 'clinics' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                Clinics
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className={`transition-colors hover:text-sky-600 ${
                  currentView === 'how-it-works' ? 'text-sky-600 font-semibold' : ''
                }`}
              >
                About
              </button>
              <button
                onClick={() => onNavigate('how-it-works')}
                className="transition-colors hover:text-sky-600"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="hidden sm:flex items-center gap-3">
            {/* User Account / Login Buttons */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-left focus:outline-none"
                >
                  <div className="w-6 h-6 bg-sky-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {user.fullName.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[130px]">
                    {user.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-1 w-48 bg-white border border-slate-200 rounded shadow-md py-1 z-50 text-xs"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="font-bold text-slate-900 truncate">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500 capitalize">{user.role}</p>
                    </div>

                    {user.role === 'patient' && (
                      <>
                        <button
                          onClick={() => {
                            onNavigate('patient-dashboard');
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>My Appointments</span>
                        </button>
                        <button
                          onClick={() => {
                            onNavigate('patient-dashboard', { tab: 'profile' });
                            setIsUserDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Medical Profile</span>
                        </button>
                      </>
                    )}

                    {user.role === 'doctor' && (
                      <button
                        onClick={() => {
                          onNavigate('doctor-dashboard');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                        <span>Doctor Dashboard</span>
                      </button>
                    )}

                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          onNavigate('admin-dashboard');
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Admin Console</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserDropdownOpen(false);
                        onNavigate('home');
                      }}
                      className="w-full text-left px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuthModal('login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-sky-700 hover:bg-slate-50 rounded transition-colors"
              >
                Login
              </button>
            )}

            {/* Book Appointment CTA Button */}
            <button
              onClick={() => onNavigate('search-doctors')}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded transition-colors"
            >
              Book Appointment
            </button>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 text-xs font-medium">
          <button
            onClick={() => {
              onNavigate('home');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            Home
          </button>
          <button
            onClick={() => {
              onNavigate('search-doctors');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            Find Doctors
          </button>
          <button
            onClick={() => {
              onNavigate('specialties');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            Specialties
          </button>
          <button
            onClick={() => {
              onNavigate('clinics');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            Clinics
          </button>
          <button
            onClick={() => {
              onNavigate('how-it-works');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            About
          </button>
          <button
            onClick={() => {
              onNavigate('how-it-works');
              setIsMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 rounded"
          >
            Contact
          </button>

          <div className="border-t border-slate-100 pt-3 mt-2 space-y-2">
            {!user ? (
              <button
                type="button"
                onClick={() => {
                  onOpenAuthModal('login');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2 text-center text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded"
              >
                Login
              </button>
            ) : (
              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-rose-600 hover:bg-rose-50 rounded"
              >
                Sign Out ({user.fullName})
              </button>
            )}

            <button
              onClick={() => {
                onNavigate('search-doctors');
                setIsMobileMenuOpen(false);
              }}
              className="w-full py-2 text-center text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded"
            >
              Book Appointment
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
