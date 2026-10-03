import { 
  Doctor, 
  Specialty, 
  City, 
  Clinic, 
  Appointment, 
  Review, 
  ActivityLog, 
  SiteSettings, 
  UserProfile, 
  FilterParams, 
  AppointmentStatus,
  DoctorScheduleDay
} from '../types';
import {
  INITIAL_DOCTORS,
  INITIAL_SPECIALTIES,
  INITIAL_CITIES,
  INITIAL_CLINICS,
  INITIAL_APPOINTMENTS,
  INITIAL_REVIEWS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_SITE_SETTINGS,
  INITIAL_USERS,
} from './mockData';
import { supabase, isSupabaseConfigured } from './supabase';

const KEYS = {
  DOCTORS: 'medicare_doctors_v1',
  SPECIALTIES: 'medicare_specialties_v1',
  CITIES: 'medicare_cities_v1',
  CLINICS: 'medicare_clinics_v1',
  APPOINTMENTS: 'medicare_appointments_v1',
  REVIEWS: 'medicare_reviews_v1',
  ACTIVITY_LOGS: 'medicare_activity_logs_v1',
  SITE_SETTINGS: 'medicare_site_settings_v1',
  USERS: 'medicare_users_v1',
  CURRENT_USER: 'medicare_current_user_v1',
};

// Generic local storage helpers
function getLocalItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    if (!data) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(data) as T;
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage`, e);
    return fallback;
  }
}

function setLocalItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage`, e);
  }
}

// Initialize seed data if empty
export function initializeStorage(): void {
  if (!localStorage.getItem(KEYS.DOCTORS)) {
    setLocalItem(KEYS.DOCTORS, INITIAL_DOCTORS);
  }
  if (!localStorage.getItem(KEYS.SPECIALTIES)) {
    setLocalItem(KEYS.SPECIALTIES, INITIAL_SPECIALTIES);
  }
  if (!localStorage.getItem(KEYS.CITIES)) {
    setLocalItem(KEYS.CITIES, INITIAL_CITIES);
  }
  if (!localStorage.getItem(KEYS.CLINICS)) {
    setLocalItem(KEYS.CLINICS, INITIAL_CLINICS);
  }
  if (!localStorage.getItem(KEYS.APPOINTMENTS)) {
    setLocalItem(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  }
  if (!localStorage.getItem(KEYS.REVIEWS)) {
    setLocalItem(KEYS.REVIEWS, INITIAL_REVIEWS);
  }
  if (!localStorage.getItem(KEYS.ACTIVITY_LOGS)) {
    setLocalItem(KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  }
  if (!localStorage.getItem(KEYS.SITE_SETTINGS)) {
    setLocalItem(KEYS.SITE_SETTINGS, INITIAL_SITE_SETTINGS);
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    setLocalItem(KEYS.USERS, INITIAL_USERS);
  }
}

// --- Activity Logs ---
export function logActivity(action: string, details: string, user?: UserProfile | null): void {
  const logs = getLocalItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
  const newLog: ActivityLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    userId: user?.id,
    userName: user?.fullName || 'Guest / System',
    userRole: user?.role || 'patient',
    action,
    details,
    timestamp: new Date().toISOString(),
    ipAddress: '127.0.0.1 (Local)',
  };
  logs.unshift(newLog);
  setLocalItem(KEYS.ACTIVITY_LOGS, logs.slice(0, 100)); // retain last 100
}

export function getActivityLogs(): ActivityLog[] {
  return getLocalItem<ActivityLog[]>(KEYS.ACTIVITY_LOGS, INITIAL_ACTIVITY_LOGS);
}

// --- Specialties & Taxonomy ---
export function getSpecialties(): Specialty[] {
  return getLocalItem<Specialty[]>(KEYS.SPECIALTIES, INITIAL_SPECIALTIES);
}

export function saveSpecialty(specialty: Omit<Specialty, 'id'> & { id?: string }): Specialty {
  const items = getSpecialties();
  if (specialty.id) {
    const idx = items.findIndex(s => s.id === specialty.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...specialty };
      setLocalItem(KEYS.SPECIALTIES, items);
      logActivity('UPDATE_SPECIALTY', `Updated specialty: ${specialty.name}`);
      return items[idx];
    }
  }
  const newSpecialty: Specialty = {
    ...specialty,
    id: 'spec-' + Date.now(),
    doctorCount: 0,
  };
  items.push(newSpecialty);
  setLocalItem(KEYS.SPECIALTIES, items);
  logActivity('CREATE_SPECIALTY', `Created new specialty: ${newSpecialty.name}`);
  return newSpecialty;
}

export function deleteSpecialty(id: string): void {
  const items = getSpecialties().filter(s => s.id !== id);
  setLocalItem(KEYS.SPECIALTIES, items);
  logActivity('DELETE_SPECIALTY', `Deleted specialty ID: ${id}`);
}

// --- Cities ---
export function getCities(): City[] {
  return getLocalItem<City[]>(KEYS.CITIES, INITIAL_CITIES);
}

export function saveCity(city: Omit<City, 'id'> & { id?: string }): City {
  const items = getCities();
  if (city.id) {
    const idx = items.findIndex(c => c.id === city.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...city };
      setLocalItem(KEYS.CITIES, items);
      logActivity('UPDATE_CITY', `Updated city: ${city.name}`);
      return items[idx];
    }
  }
  const newCity: City = {
    ...city,
    id: 'city-' + Date.now(),
  };
  items.push(newCity);
  setLocalItem(KEYS.CITIES, items);
  logActivity('CREATE_CITY', `Created new city: ${newCity.name}, ${newCity.state}`);
  return newCity;
}

export function deleteCity(id: string): void {
  const items = getCities().filter(c => c.id !== id);
  setLocalItem(KEYS.CITIES, items);
  logActivity('DELETE_CITY', `Deleted city ID: ${id}`);
}

// --- Clinics ---
export function getClinics(): Clinic[] {
  return getLocalItem<Clinic[]>(KEYS.CLINICS, INITIAL_CLINICS);
}

export function saveClinic(clinic: Omit<Clinic, 'id'> & { id?: string }): Clinic {
  const items = getClinics();
  if (clinic.id) {
    const idx = items.findIndex(c => c.id === clinic.id);
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...clinic };
      setLocalItem(KEYS.CLINICS, items);
      logActivity('UPDATE_CLINIC', `Updated clinic: ${clinic.name}`);
      return items[idx];
    }
  }
  const newClinic: Clinic = {
    ...clinic,
    id: 'clinic-' + Date.now(),
  };
  items.push(newClinic);
  setLocalItem(KEYS.CLINICS, items);
  logActivity('CREATE_CLINIC', `Added clinic: ${newClinic.name}`);
  return newClinic;
}

// --- Doctors ---
export function getDoctors(params?: FilterParams): Doctor[] {
  let doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);

  if (!params) return doctors;

  if (params.specialtyId) {
    doctors = doctors.filter(d => d.specialtyId === params.specialtyId);
  }

  if (params.cityId) {
    doctors = doctors.filter(d => d.cityId === params.cityId);
  }

  if (params.gender && params.gender !== 'all') {
    doctors = doctors.filter(d => d.gender === params.gender);
  }

  if (params.maxFee) {
    doctors = doctors.filter(d => d.consultationFee <= (params.maxFee as number));
  }

  if (params.minRating) {
    doctors = doctors.filter(d => d.rating >= (params.minRating as number));
  }

  if (params.minExperience) {
    doctors = doctors.filter(d => d.experienceYears >= (params.minExperience as number));
  }

  if (params.availableTodayOnly) {
    doctors = doctors.filter(d => d.availableToday);
  }

  if (params.searchQuery && params.searchQuery.trim() !== '') {
    const q = params.searchQuery.toLowerCase().trim();
    doctors = doctors.filter(
      d =>
        d.fullName.toLowerCase().includes(q) ||
        d.specialtyName.toLowerCase().includes(q) ||
        d.clinicName.toLowerCase().includes(q) ||
        d.cityName.toLowerCase().includes(q) ||
        d.bio.toLowerCase().includes(q)
    );
  }

  // Sorting
  if (params.sortBy) {
    switch (params.sortBy) {
      case 'rating':
        doctors.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        doctors.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case 'fee_asc':
        doctors.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case 'fee_desc':
        doctors.sort((a, b) => b.consultationFee - a.consultationFee);
        break;
      case 'name':
        doctors.sort((a, b) => a.fullName.localeCompare(b.fullName));
        break;
      case 'recommended':
      default:
        doctors.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
        break;
    }
  }

  return doctors;
}

export function getDoctorById(id: string): Doctor | undefined {
  const doctors = getDoctors();
  return doctors.find(d => d.id === id);
}

export function getDoctorByUserId(userId: string): Doctor | undefined {
  const doctors = getDoctors();
  return doctors.find(d => d.userId === userId);
}

export function saveDoctor(doctorData: Partial<Doctor> & { id: string }): Doctor {
  const doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorData.id);
  if (idx >= 0) {
    doctors[idx] = { ...doctors[idx], ...doctorData } as Doctor;
    setLocalItem(KEYS.DOCTORS, doctors);
    logActivity('UPDATE_DOCTOR', `Updated profile of ${doctors[idx].fullName}`);
    return doctors[idx];
  }
  throw new Error('Doctor not found');
}

export function createDoctorProfile(newDoctor: Omit<Doctor, 'id'>): Doctor {
  const doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);
  const doctor: Doctor = {
    ...newDoctor,
    id: 'doc-' + Date.now(),
  };
  doctors.push(doctor);
  setLocalItem(KEYS.DOCTORS, doctors);
  logActivity('REGISTER_DOCTOR', `Doctor application submitted: ${doctor.fullName}`);
  return doctor;
}

export function toggleDoctorVerification(doctorId: string, isVerified: boolean): void {
  const doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx >= 0) {
    doctors[idx].isVerified = isVerified;
    setLocalItem(KEYS.DOCTORS, doctors);
    logActivity(
      isVerified ? 'VERIFY_DOCTOR' : 'UNVERIFY_DOCTOR',
      `Changed verification status for ${doctors[idx].fullName} to ${isVerified}`
    );
  }
}

export function toggleDoctorFeatured(doctorId: string, isFeatured: boolean): void {
  const doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx >= 0) {
    doctors[idx].isFeatured = isFeatured;
    setLocalItem(KEYS.DOCTORS, doctors);
    logActivity('FEATURE_DOCTOR', `Updated featured status for ${doctors[idx].fullName} to ${isFeatured}`);
  }
}

export function updateDoctorSchedule(doctorId: string, schedules: DoctorScheduleDay[]): void {
  const doctors = getLocalItem<Doctor[]>(KEYS.DOCTORS, INITIAL_DOCTORS);
  const idx = doctors.findIndex(d => d.id === doctorId);
  if (idx >= 0) {
    doctors[idx].schedules = schedules;
    setLocalItem(KEYS.DOCTORS, doctors);
    logActivity('UPDATE_SCHEDULE', `Updated weekly schedule for ${doctors[idx].fullName}`);
  }
}

// Generate available slots for a given doctor on a given date
export function getAvailableSlotsForDate(doctor: Doctor, dateStr: string): string[] {
  const dateObj = new Date(dateStr + 'T00:00:00');
  const dayOfWeek = dateObj.getDay();
  const scheduleDay = doctor.schedules?.find(s => s.dayOfWeek === dayOfWeek);

  if (!scheduleDay || !scheduleDay.isEnabled) {
    return [];
  }

  // Generate slot intervals between start and end time
  const [startHour, startMin] = scheduleDay.startTime.split(':').map(Number);
  const [endHour, endMin] = scheduleDay.endTime.split(':').map(Number);
  const duration = scheduleDay.slotDurationMinutes || 30;

  const startTotalMins = startHour * 60 + startMin;
  const endTotalMins = endHour * 60 + endMin;

  const breakStartTotal = scheduleDay.breakStartTime 
    ? parseInt(scheduleDay.breakStartTime.split(':')[0]) * 60 + parseInt(scheduleDay.breakStartTime.split(':')[1]) 
    : -1;
  const breakEndTotal = scheduleDay.breakEndTime 
    ? parseInt(scheduleDay.breakEndTime.split(':')[0]) * 60 + parseInt(scheduleDay.breakEndTime.split(':')[1]) 
    : -1;

  // Check already booked slots for this doctor on this date
  const appointments = getAppointments().filter(
    a => a.doctorId === doctor.id && a.appointmentDate === dateStr && a.status !== 'cancelled' && a.status !== 'rejected'
  );
  const bookedTimes = new Set(appointments.map(a => a.appointmentTime));

  const availableSlots: string[] = [];
  for (let mins = startTotalMins; mins + duration <= endTotalMins; mins += duration) {
    // Check if slot falls in break
    if (breakStartTotal !== -1 && breakEndTotal !== -1) {
      if (mins >= breakStartTotal && mins < breakEndTotal) {
        continue;
      }
    }

    const h = Math.floor(mins / 60);
    const m = mins % 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    const displayMin = m < 10 ? '0' + m : m;
    const timeFormatted = `${displayHour}:${displayMin} ${period}`;

    if (!bookedTimes.has(timeFormatted)) {
      availableSlots.push(timeFormatted);
    }
  }

  return availableSlots;
}

// --- Appointments ---
export function getAppointments(filters?: {
  patientId?: string;
  doctorId?: string;
  status?: AppointmentStatus;
  date?: string;
}): Appointment[] {
  let appointments = getLocalItem<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);

  if (filters?.patientId) {
    appointments = appointments.filter(a => a.patientId === filters.patientId);
  }
  if (filters?.doctorId) {
    appointments = appointments.filter(a => a.doctorId === filters.doctorId);
  }
  if (filters?.status) {
    appointments = appointments.filter(a => a.status === filters.status);
  }
  if (filters?.date) {
    appointments = appointments.filter(a => a.appointmentDate === filters.date);
  }

  // Sort latest first
  return appointments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAppointmentById(id: string): Appointment | undefined {
  const items = getAppointments();
  return items.find(a => a.id === id || a.tokenNumber === id);
}

export function createAppointment(appointmentData: Omit<Appointment, 'id' | 'tokenNumber' | 'createdAt' | 'status'>): Appointment {
  const appointments = getLocalItem<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const randomTokenNum = Math.floor(1000 + Math.random() * 9000);
  const newAppointment: Appointment = {
    ...appointmentData,
    id: 'apt-' + Date.now(),
    tokenNumber: `MED-${new Date().getFullYear()}-${randomTokenNum}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  appointments.unshift(newAppointment);
  setLocalItem(KEYS.APPOINTMENTS, appointments);

  // Sync to Supabase table if configured
  if (isSupabaseConfigured) {
    Promise.resolve(
      supabase.from('appointments').insert([{
        id: newAppointment.id,
        token_number: newAppointment.tokenNumber,
        patient_name: newAppointment.patientName,
        patient_email: newAppointment.patientEmail,
        patient_phone: newAppointment.patientPhone,
        patient_gender: newAppointment.patientGender,
        patient_age: newAppointment.patientAge,
        doctor_id: newAppointment.doctorId,
        appointment_date: newAppointment.appointmentDate,
        appointment_time: newAppointment.appointmentTime,
        status: newAppointment.status,
        consultation_type: newAppointment.consultationType,
        consultation_fee: newAppointment.consultationFee,
        reason_for_visit: newAppointment.reasonForVisit,
        symptoms: newAppointment.symptoms,
        is_first_visit: newAppointment.isFirstVisit,
      }])
    ).then((res: any) => {
      if (res?.error) console.warn('[Supabase Sync Notice]:', res.error.message);
    }).catch((err: any) => console.warn('Supabase sync error:', err));
  }

  logActivity(
    'BOOK_APPOINTMENT',
    `New appointment ${newAppointment.tokenNumber} booked by ${newAppointment.patientName} with ${newAppointment.doctorName} for ${newAppointment.appointmentDate}`
  );

  return newAppointment;
}

export function updateAppointmentStatus(
  appointmentId: string, 
  status: AppointmentStatus, 
  extra?: { doctorNotes?: string; prescriptionSummary?: string; cancellationReason?: string; newDate?: string; newTime?: string }
): Appointment {
  const appointments = getLocalItem<Appointment[]>(KEYS.APPOINTMENTS, INITIAL_APPOINTMENTS);
  const idx = appointments.findIndex(a => a.id === appointmentId);
  if (idx === -1) throw new Error('Appointment not found');

  appointments[idx].status = status;
  if (extra?.doctorNotes !== undefined) appointments[idx].doctorNotes = extra.doctorNotes;
  if (extra?.prescriptionSummary !== undefined) appointments[idx].prescriptionSummary = extra.prescriptionSummary;
  if (extra?.cancellationReason !== undefined) appointments[idx].cancellationReason = extra.cancellationReason;
  if (extra?.newDate) appointments[idx].appointmentDate = extra.newDate;
  if (extra?.newTime) appointments[idx].appointmentTime = extra.newTime;

  setLocalItem(KEYS.APPOINTMENTS, appointments);

  logActivity(
    'UPDATE_APPOINTMENT_STATUS',
    `Appointment ${appointments[idx].tokenNumber} status changed to ${status.toUpperCase()}`
  );

  return appointments[idx];
}

// --- Reviews ---
export function getReviews(doctorId?: string): Review[] {
  let reviews = getLocalItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  if (doctorId) {
    reviews = reviews.filter(r => r.doctorId === doctorId && r.isApproved);
  }
  return reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getAllReviewsAdmin(): Review[] {
  return getLocalItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
}

export function addReview(data: Omit<Review, 'id' | 'createdAt' | 'isApproved'>): Review {
  const reviews = getLocalItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  const newReview: Review = {
    ...data,
    id: 'rev-' + Date.now(),
    createdAt: new Date().toISOString(),
    isApproved: true, // Auto-approved in demo, can be toggled by admin
  };
  reviews.unshift(newReview);
  setLocalItem(KEYS.REVIEWS, reviews);

  // Recalculate doctor rating
  const doctor = getDoctorById(data.doctorId);
  if (doctor) {
    const docReviews = reviews.filter(r => r.doctorId === data.doctorId && r.isApproved);
    const avg = docReviews.reduce((sum, r) => sum + r.rating, 0) / docReviews.length;
    saveDoctor({
      id: doctor.id,
      rating: Number(avg.toFixed(2)),
      reviewCount: docReviews.length,
    });
  }

  logActivity('ADD_REVIEW', `Patient ${data.patientName} reviewed doctor ID ${data.doctorId} (${data.rating}/5 stars)`);
  return newReview;
}

export function toggleReviewApproval(reviewId: string, isApproved: boolean): void {
  const reviews = getLocalItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS);
  const idx = reviews.findIndex(r => r.id === reviewId);
  if (idx >= 0) {
    reviews[idx].isApproved = isApproved;
    setLocalItem(KEYS.REVIEWS, reviews);
    logActivity('MODERATE_REVIEW', `Moderated review ID ${reviewId} approval to ${isApproved}`);
  }
}

export function deleteReview(reviewId: string): void {
  const reviews = getLocalItem<Review[]>(KEYS.REVIEWS, INITIAL_REVIEWS).filter(r => r.id !== reviewId);
  setLocalItem(KEYS.REVIEWS, reviews);
  logActivity('DELETE_REVIEW', `Deleted review ID ${reviewId}`);
}

// --- Users & Profiles ---
export function getUsers(): UserProfile[] {
  return getLocalItem<UserProfile[]>(KEYS.USERS, INITIAL_USERS);
}

export function saveUserProfile(profile: UserProfile): UserProfile {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === profile.id || u.email.toLowerCase() === profile.email.toLowerCase());
  if (idx >= 0) {
    users[idx] = { ...users[idx], ...profile };
  } else {
    users.push(profile);
  }
  setLocalItem(KEYS.USERS, users);

  // Sync to Supabase profiles table if configured
  if (isSupabaseConfigured) {
    Promise.resolve(
      supabase.from('profiles').upsert([{
        id: profile.id,
        email: profile.email,
        full_name: profile.fullName,
        role: profile.role,
        phone: profile.phone,
        blood_group: profile.bloodGroup,
        address: profile.address,
        gender: profile.gender,
        date_of_birth: profile.dateOfBirth,
      }])
    ).then((res: any) => {
      if (res?.error) console.warn('[Supabase Profile Sync Notice]:', res.error.message);
    }).catch((err: any) => console.warn('Supabase profile sync error:', err));
  }

  return profile;
}

export function deleteUser(userId: string): void {
  const users = getUsers().filter(u => u.id !== userId);
  setLocalItem(KEYS.USERS, users);
  logActivity('DELETE_USER', `Admin deleted user profile ID ${userId}`);
}

// --- Site Settings ---
export function getSiteSettings(): SiteSettings {
  return getLocalItem<SiteSettings>(KEYS.SITE_SETTINGS, INITIAL_SITE_SETTINGS);
}

export function saveSiteSettings(settings: SiteSettings): SiteSettings {
  setLocalItem(KEYS.SITE_SETTINGS, settings);
  logActivity('UPDATE_SETTINGS', 'Updated website general configurations');
  return settings;
}
