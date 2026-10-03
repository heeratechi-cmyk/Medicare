export type UserRole = 'patient' | 'doctor' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  // Patient specific
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  allergies?: string[];
  emergencyContact?: string;
  address?: string;
}

export interface Specialty {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  description: string;
  doctorCount?: number;
}

export interface City {
  id: string;
  name: string;
  state: string;
  country: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  cityId: string;
  cityName: string;
  phone: string;
  email?: string;
  openingHours: string;
  image?: string;
}

export interface DoctorScheduleDay {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  dayName: string;
  isEnabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
  slotDurationMinutes: number; // e.g. 20, 30
  breakStartTime?: string; // "13:00"
  breakEndTime?: string;   // "14:00"
}

export interface Doctor {
  id: string;
  userId: string;
  fullName: string;
  title: string; // "Dr. Robert Smith, MD"
  email: string;
  phone: string;
  avatarUrl: string;
  specialtyId: string;
  specialtyName: string;
  cityId: string;
  cityName: string;
  clinicId?: string;
  clinicName: string;
  clinicAddress: string;
  experienceYears: number;
  consultationFee: number; // Informational consultation fee (in USD/local currency)
  rating: number;
  reviewCount: number;
  qualifications: string[]; // ["MBBS - Harvard Medical School", "MD Cardiology - Johns Hopkins", "Fellow of American College of Cardiology"]
  bio: string;
  languages: string[];
  gender: 'male' | 'female' | 'other';
  isVerified: boolean;
  isFeatured: boolean;
  registrationNumber: string; // Medical license/reg #
  schedules: DoctorScheduleDay[];
  availableToday: boolean;
  nextAvailableDate: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rejected';
export type ConsultationType = 'in-person' | 'video';

export interface Appointment {
  id: string;
  tokenNumber: string; // e.g. "MED-2026-8492"
  patientId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  patientGender?: 'male' | 'female' | 'other';
  patientAge?: number;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  doctorAvatarUrl: string;
  clinicName: string;
  clinicAddress: string;
  appointmentDate: string; // "YYYY-MM-DD"
  appointmentTime: string; // "10:30 AM"
  status: AppointmentStatus;
  consultationType: ConsultationType;
  consultationFee: number;
  reasonForVisit: string;
  symptoms?: string;
  isFirstVisit: boolean;
  createdAt: string;
  doctorNotes?: string;
  prescriptionSummary?: string;
  cancellationReason?: string;
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  patientName: string;
  rating: number; // 1 - 5
  comment: string;
  visitReason: string;
  createdAt: string;
  isApproved: boolean;
}

export interface ActivityLog {
  id: string;
  userId?: string;
  userName: string;
  userRole: UserRole;
  action: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export interface SiteSettings {
  siteName: string;
  siteEmail: string;
  sitePhone: string;
  emergencyHotline: string;
  address: string;
  currencySymbol: string;
  appointmentLeadHours: number; // minimum notice required before appointment
  slotIntervalMinutes: number;
  allowPatientCancellation: boolean;
  maintenanceMode: boolean;
}

export interface FilterParams {
  specialtyId?: string;
  cityId?: string;
  searchQuery?: string;
  date?: string;
  gender?: string;
  maxFee?: number;
  minRating?: number;
  minExperience?: number;
  availableTodayOnly?: boolean;
  sortBy?: 'recommended' | 'rating' | 'experience' | 'fee_asc' | 'fee_desc' | 'name';
}
