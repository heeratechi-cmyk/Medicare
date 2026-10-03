-- =============================================================================
-- MediCare - Doctor Appointment Booking Platform Database Schema (Supabase PostgreSQL)
-- =============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE consultation_type AS ENUM ('in-person', 'video');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. PROFILES TABLE (Linked with auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'patient' NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    date_of_birth DATE,
    gender TEXT,
    blood_group TEXT,
    allergies TEXT[],
    emergency_contact TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. CITIES TABLE
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT DEFAULT 'USA' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 5. SPECIALTIES TABLE
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT DEFAULT 'Activity' NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. CLINICS TABLE
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    email TEXT,
    opening_hours TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    avatar_url TEXT,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    clinic_name TEXT NOT NULL,
    clinic_address TEXT NOT NULL,
    experience_years INTEGER DEFAULT 0 NOT NULL,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    rating NUMERIC(3, 2) DEFAULT 5.00 NOT NULL,
    review_count INTEGER DEFAULT 0 NOT NULL,
    qualifications TEXT[] DEFAULT '{}' NOT NULL,
    bio TEXT,
    languages TEXT[] DEFAULT '{"English"}' NOT NULL,
    gender TEXT DEFAULT 'male' NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    registration_number TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. DOCTOR SCHEDULES TABLE
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    day_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    slot_duration_minutes INTEGER DEFAULT 30 NOT NULL,
    break_start_time TIME,
    break_end_time TIME,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(doctor_id, day_of_week)
);

-- 9. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token_number TEXT UNIQUE NOT NULL,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_gender TEXT,
    patient_age INTEGER,
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    doctor_name TEXT NOT NULL,
    doctor_specialty TEXT NOT NULL,
    doctor_avatar_url TEXT,
    clinic_name TEXT NOT NULL,
    clinic_address TEXT NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    status appointment_status DEFAULT 'pending' NOT NULL,
    consultation_type consultation_type DEFAULT 'in-person' NOT NULL,
    consultation_fee NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    reason_for_visit TEXT NOT NULL,
    symptoms TEXT,
    is_first_visit BOOLEAN DEFAULT TRUE NOT NULL,
    doctor_notes TEXT,
    prescription_summary TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 10. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE NOT NULL,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    patient_name TEXT NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5) NOT NULL,
    comment TEXT NOT NULL,
    visit_reason TEXT,
    is_approved BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    site_name TEXT DEFAULT 'MediCare Healthcare Network' NOT NULL,
    site_email TEXT DEFAULT 'contact@medicare-health.org' NOT NULL,
    site_phone TEXT DEFAULT '+1 (800) 555-2273' NOT NULL,
    emergency_hotline TEXT DEFAULT '911 / +1 (800) 555-9999' NOT NULL,
    address TEXT DEFAULT '742 Evergreen Terrace, Medical District, NY 10001' NOT NULL,
    currency_symbol TEXT DEFAULT '$' NOT NULL,
    appointment_lead_hours INTEGER DEFAULT 2 NOT NULL,
    slot_interval_minutes INTEGER DEFAULT 30 NOT NULL,
    allow_patient_cancellation BOOLEAN DEFAULT TRUE NOT NULL,
    maintenance_mode BOOLEAN DEFAULT FALSE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 13. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access to specialties, cities, clinics, verified doctors, schedules, approved reviews
CREATE POLICY "Allow public read on specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Allow public read on cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read on clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow public read on doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read on doctor_schedules" ON public.doctor_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read on approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow public read on site_settings" ON public.site_settings FOR SELECT USING (true);

-- User Profiles: users can read and update their own profile; admins can read all
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Appointments RLS:
-- Patients can view their own appointments
CREATE POLICY "Patients view own appointments" ON public.appointments FOR SELECT USING (
    auth.uid() = patient_id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR (SELECT user_id FROM public.doctors WHERE id = doctor_id) = auth.uid()
);

-- Patients can create appointments
CREATE POLICY "Patients can insert appointments" ON public.appointments FOR INSERT WITH CHECK (
    auth.uid() = patient_id
);

-- Doctors & Admins can update appointments
CREATE POLICY "Doctors and Admins update appointments" ON public.appointments FOR UPDATE USING (
    (SELECT user_id FROM public.doctors WHERE id = doctor_id) = auth.uid()
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
    OR (auth.uid() = patient_id AND status = 'pending')
);

-- Real-time publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
