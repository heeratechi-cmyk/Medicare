import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PrintableAppointmentSlip } from './components/common/PrintableAppointmentSlip';
import { BookingModal } from './components/public/BookingModal';
import { AuthModal } from './components/public/AuthModal';
import { HomePage } from './components/public/HomePage';
import { DoctorSearchPage } from './components/public/DoctorSearchPage';
import { DoctorProfilePage } from './components/public/DoctorProfilePage';
import { SpecialtiesPage } from './components/public/SpecialtiesPage';
import { ClinicsPage } from './components/public/ClinicsPage';
import { HowItWorksPage } from './components/public/HowItWorksPage';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { DoctorDashboard } from './components/doctor/DoctorDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { 
  getDoctors, 
  getSpecialties, 
  getCities, 
  getClinics, 
  getAppointments, 
  getReviews, 
  getActivityLogs, 
  getSiteSettings,
  initializeStorage
} from './lib/storage';
import { SearchLoadingOverlay } from './components/common/SearchLoadingOverlay';
import { Doctor, Specialty, City, Clinic, Appointment, Review, ActivityLog, SiteSettings, UserRole } from './types';

function MainApp() {
  const { user, role } = useAuth();

  // Navigation State
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [loadingTitle, setLoadingTitle] = useState<string>('Processing...');
  const [loadingSubtitle, setLoadingSubtitle] = useState<string>('Please wait...');

  // App Data State
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null);

  // Modals
  const [bookingDoctor, setBookingDoctor] = useState<Doctor | null>(null);
  const [bookingInitialDate, setBookingInitialDate] = useState<string | undefined>(undefined);
  const [printSlipAppointment, setPrintSlipAppointment] = useState<Appointment | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalRole, setAuthModalRole] = useState<UserRole>('patient');

  // Load all data
  const refreshData = () => {
    initializeStorage();
    setDoctors(getDoctors());
    setSpecialties(getSpecialties());
    setCities(getCities());
    setClinics(getClinics());
    setAppointments(getAppointments());
    setReviews(getReviews());
    setActivityLogs(getActivityLogs());
    setSiteSettings(getSiteSettings());
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Guarantee scroll resets to the top on every page and button navigation
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [currentView, viewParams]);

  const handleNavigate = (view: string, data?: any) => {
    // Dynamic messages based on clicked button action
    let title = 'Processing...';
    let subtitle = 'Please wait while we prepare your information';

    switch (view) {
      case 'search-doctors':
        title = 'Finding Specialist Doctors...';
        subtitle = 'Checking hospital OPD schedules and verified slots';
        break;
      case 'doctor-profile':
        title = 'Loading Doctor Profile...';
        subtitle = 'Fetching credentials, consultation fee & open timings';
        break;
      case 'specialties':
        title = 'Loading Medical Specialties...';
        subtitle = 'Preparing clinical departments & specialist directories';
        break;
      case 'clinics':
        title = 'Loading Hospitals & Clinics...';
        subtitle = 'Retrieving partner medical center listings';
        break;
      case 'patient-dashboard':
        title = 'Loading Patient Portal...';
        subtitle = 'Synchronizing your appointments and history';
        break;
      case 'doctor-dashboard':
        title = 'Loading Doctor Dashboard...';
        subtitle = 'Accessing OPD queue and daily roster';
        break;
      case 'admin-dashboard':
        title = 'Loading Admin Console...';
        subtitle = 'Verifying operational database records';
        break;
      case 'home':
        title = 'Loading MediCare...';
        subtitle = 'Returning to main healthcare portal';
        break;
      default:
        title = 'Loading...';
        subtitle = 'Please wait a moment';
        break;
    }

    setLoadingTitle(title);
    setLoadingSubtitle(subtitle);
    setIsSearching(true);

    setTimeout(() => {
      setCurrentView(view);
      setViewParams(data || {});
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      setIsSearching(false);
    }, 450);
  };

  const handleOpenBooking = (doctor: Doctor, initialDate?: string) => {
    setBookingDoctor(doctor);
    setBookingInitialDate(initialDate);
  };

  const handleOpenAuthModal = (mode: 'login' | 'signup' = 'login', defaultRole: UserRole = 'patient') => {
    setAuthModalMode(mode);
    setAuthModalRole(defaultRole);
    setIsAuthModalOpen(true);
  };

  // Featured doctors for homepage
  const featuredDoctors = doctors.filter(d => d.isFeatured && d.isVerified);

  // Selected doctor for profile view
  const selectedDoctor = viewParams.doctorId
    ? doctors.find(d => d.id === viewParams.doctorId) || doctors[0]
    : doctors[0];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header */}
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'home' && (
          <HomePage
            specialties={specialties}
            cities={cities}
            featuredDoctors={featuredDoctors.length > 0 ? featuredDoctors : doctors.slice(0, 3)}
            reviews={reviews}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentView === 'search-doctors' && (
          <DoctorSearchPage
            doctors={doctors}
            specialties={specialties}
            cities={cities}
            initialFilters={viewParams}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
          />
        )}

        {currentView === 'doctor-profile' && selectedDoctor && (
          <DoctorProfilePage
            doctor={selectedDoctor}
            reviews={reviews}
            onNavigate={handleNavigate}
            onOpenBooking={handleOpenBooking}
            onReviewAdded={refreshData}
          />
        )}

        {currentView === 'specialties' && (
          <SpecialtiesPage
            specialties={specialties}
            doctors={doctors}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'clinics' && (
          <ClinicsPage
            clinics={clinics}
            doctors={doctors}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'how-it-works' && (
          <HowItWorksPage onNavigate={handleNavigate} />
        )}

        {currentView === 'patient-dashboard' && (
          <PatientDashboard
            appointments={appointments}
            doctors={doctors}
            initialTab={viewParams?.tab}
            onNavigate={handleNavigate}
            onOpenPrintSlip={(apt) => setPrintSlipAppointment(apt)}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'doctor-dashboard' && (
          <DoctorDashboard
            appointments={appointments}
            doctors={doctors}
            onNavigate={handleNavigate}
            onOpenPrintSlip={(apt) => setPrintSlipAppointment(apt)}
            onRefreshData={refreshData}
          />
        )}

        {currentView === 'admin-dashboard' && siteSettings && (
          <AdminDashboard
            doctors={doctors}
            appointments={appointments}
            specialties={specialties}
            cities={cities}
            reviews={reviews}
            activityLogs={activityLogs}
            siteSettings={siteSettings}
            onRefreshData={refreshData}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} onOpenAuthModal={handleOpenAuthModal} />

      {/* Professional 3-Dots Animation Screen Blocker Overlay */}
      {isSearching && <SearchLoadingOverlay title={loadingTitle} subtitle={loadingSubtitle} />}

      {/* Booking Modal */}
      {bookingDoctor && (
        <BookingModal
          doctor={bookingDoctor}
          initialDate={bookingInitialDate}
          onClose={() => {
            setBookingDoctor(null);
            setBookingInitialDate(undefined);
          }}
          onSuccess={(newApt) => {
            refreshData();
          }}
          onOpenPrintSlip={(newApt) => {
            setBookingDoctor(null);
            setBookingInitialDate(undefined);
            setPrintSlipAppointment(newApt);
          }}
        />
      )}

      {/* Printable Appointment Pass / Slip */}
      {printSlipAppointment && (
        <PrintableAppointmentSlip
          appointment={printSlipAppointment}
          onClose={() => setPrintSlipAppointment(null)}
        />
      )}

      {/* Auth Modal with Eye toggle, 4-digit OTP & 60s Resend */}
      {isAuthModalOpen && (
        <AuthModal
          initialMode={authModalMode}
          defaultRole={authModalRole}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={() => {
            refreshData();
          }}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
