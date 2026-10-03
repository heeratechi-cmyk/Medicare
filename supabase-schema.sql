-- ============================================================================
-- MediCare - Complete Supabase PostgreSQL Schema & Migrations
-- Compatible with Supabase Database, Auth, and Row-Level Security (RLS)
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Custom Enumeration Types
CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
CREATE TYPE user_gender AS ENUM ('male', 'female', 'other');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'rejected');
CREATE TYPE consultation_type AS ENUM ('in-person', 'video');

-- ============================================================================
-- 3. Tables Definition
-- ============================================================================

-- A. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'patient',
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300',
    date_of_birth DATE,
    gender user_gender,
    blood_group VARCHAR(10),
    allergies TEXT[] DEFAULT ARRAY[]::TEXT[],
    emergency_contact TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- B. SPECIALTIES TABLE
CREATE TABLE IF NOT EXISTS public.specialties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- C. CITIES TABLE
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'Pakistan',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT unique_city_state UNIQUE (name, state)
);

-- D. CLINICS / HOSPITALS TABLE
CREATE TABLE IF NOT EXISTS public.clinics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    phone TEXT NOT NULL,
    email TEXT,
    opening_hours TEXT NOT NULL DEFAULT '09:00 AM - 09:00 PM',
    image TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- E. DOCTORS TABLE
CREATE TABLE IF NOT EXISTS public.doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    avatar_url TEXT NOT NULL,
    specialty_id UUID REFERENCES public.specialties(id) ON DELETE SET NULL,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
    experience_years INT NOT NULL DEFAULT 1,
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    rating NUMERIC(3, 2) NOT NULL DEFAULT 5.00,
    review_count INT NOT NULL DEFAULT 0,
    qualifications TEXT[] DEFAULT ARRAY[]::TEXT[],
    bio TEXT,
    languages TEXT[] DEFAULT ARRAY['English', 'Urdu']::TEXT[],
    gender user_gender NOT NULL DEFAULT 'male',
    is_verified BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    registration_number TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- F. DOCTOR SCHEDULES TABLE (OPD Slot Timings)
CREATE TABLE IF NOT EXISTS public.doctor_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    day_name TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    start_time TIME NOT NULL DEFAULT '09:00:00',
    end_time TIME NOT NULL DEFAULT '17:00:00',
    slot_duration_minutes INT NOT NULL DEFAULT 20,
    break_start_time TIME DEFAULT '13:00:00',
    break_end_time TIME DEFAULT '14:00:00',
    CONSTRAINT unique_doctor_schedule_day UNIQUE (doctor_id, day_of_week)
);

-- G. APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_number TEXT NOT NULL UNIQUE, -- e.g. "MED-2026-8492"
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    patient_email TEXT NOT NULL,
    patient_phone TEXT NOT NULL,
    patient_gender user_gender,
    patient_age INT,
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE RESTRICT,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    status appointment_status NOT NULL DEFAULT 'pending',
    consultation_type consultation_type NOT NULL DEFAULT 'in-person',
    consultation_fee NUMERIC(10, 2) NOT NULL DEFAULT 2000.00,
    reason_for_visit TEXT NOT NULL,
    symptoms TEXT,
    is_first_visit BOOLEAN DEFAULT TRUE,
    doctor_notes TEXT,
    prescription_summary TEXT,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- H. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    patient_name TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL,
    visit_reason TEXT NOT NULL DEFAULT 'General Consultation',
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- I. ACTIVITY LOGS TABLE (Audit trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT NOT NULL,
    user_role user_role NOT NULL,
    action TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT,
    timestamp TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- J. SITE SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    site_name TEXT NOT NULL DEFAULT 'MediCare Pakistan',
    site_email TEXT NOT NULL DEFAULT 'support@medicare.pk',
    site_phone TEXT NOT NULL DEFAULT '+92 (042) 111-CARE',
    emergency_hotline TEXT NOT NULL DEFAULT '1122',
    address TEXT NOT NULL DEFAULT 'Jail Road, Main Boulevard Gulberg, Lahore, Pakistan',
    currency_symbol TEXT NOT NULL DEFAULT 'Rs.',
    appointment_lead_hours INT NOT NULL DEFAULT 2,
    slot_interval_minutes INT NOT NULL DEFAULT 20,
    allow_patient_cancellation BOOLEAN NOT NULL DEFAULT TRUE,
    maintenance_mode BOOLEAN NOT NULL DEFAULT FALSE,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================================================
-- 4. Indexes for High-Performance Queries
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON public.doctors(specialty_id);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON public.doctors(city_id);
CREATE INDEX IF NOT EXISTS idx_doctors_clinic ON public.doctors(clinic_id);
CREATE INDEX IF NOT EXISTS idx_doctors_featured ON public.doctors(is_featured, is_verified);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_date ON public.appointments(doctor_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_reviews_doctor ON public.reviews(doctor_id);

-- ============================================================================
-- 5. Automatic updated_at Trigger Function
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_doctors_updated_at BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- 6. Automatic User Sync Trigger from Supabase Auth
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'patient')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- 7. Row Level Security (RLS) Policies
-- ============================================================================
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

-- Profiles: Anyone can read doctor/public profile; Users can edit their own profile
CREATE POLICY "Public profiles are readable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Public Read Catalog: Specialties, Cities, Clinics, Doctors, Schedules
CREATE POLICY "Allow public read on specialties" ON public.specialties FOR SELECT USING (true);
CREATE POLICY "Allow public read on cities" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Allow public read on clinics" ON public.clinics FOR SELECT USING (true);
CREATE POLICY "Allow public read on verified doctors" ON public.doctors FOR SELECT USING (true);
CREATE POLICY "Allow public read on doctor schedules" ON public.doctor_schedules FOR SELECT USING (true);
CREATE POLICY "Allow public read on approved reviews" ON public.reviews FOR SELECT USING (is_approved = true);
CREATE POLICY "Allow public read on site settings" ON public.site_settings FOR SELECT USING (true);

-- Appointments:
-- 1. Patients can see their own appointments
-- 2. Doctors can see appointments booked with them
-- 3. Anyone can create an appointment (guest or authenticated)
CREATE POLICY "Patients view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = patient_id);

CREATE POLICY "Doctors view their assigned appointments" ON public.appointments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.doctors
            WHERE public.doctors.id = public.appointments.doctor_id
            AND public.doctors.user_id = auth.uid()
        )
    );

CREATE POLICY "Anyone can book an appointment" ON public.appointments
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Doctors and Patients can update appointment status" ON public.appointments
    FOR UPDATE USING (
        auth.uid() = patient_id OR 
        EXISTS (
            SELECT 1 FROM public.doctors 
            WHERE public.doctors.id = public.appointments.doctor_id 
            AND public.doctors.user_id = auth.uid()
        )
    );

-- Reviews: Authenticated patients can insert reviews
CREATE POLICY "Patients can insert reviews" ON public.reviews
    FOR INSERT WITH CHECK (true);

-- ============================================================================
-- 8. Seed Data (Pakistan Medical Ecosystem)
-- ============================================================================

-- Insert Site Settings
INSERT INTO public.site_settings (id, site_name, site_email, site_phone, emergency_hotline, address, currency_symbol)
VALUES (1, 'MediCare Pakistan', 'support@medicare.pk', '+92 (042) 111-CARE', '1122', 'Jail Road, Main Boulevard Gulberg, Lahore, Pakistan', 'Rs.')
ON CONFLICT (id) DO NOTHING;

-- Insert Specialties
INSERT INTO public.specialties (id, name, slug, icon_name, description) VALUES
('11111111-1111-1111-1111-111111111101', 'Cardiologist', 'cardiologist', 'HeartPulse', 'Heart disease, hypertension, ECG, angiography and cardiovascular care.'),
('11111111-1111-1111-1111-111111111102', 'Dermatologist', 'dermatologist', 'Sparkles', 'Skin treatments, acne, eczema, laser aesthetics, and hair conditions.'),
('11111111-1111-1111-1111-111111111103', 'Gynecologist', 'gynecologist', 'Baby', 'Women healthcare, obstetrics, pregnancy care, and maternal health.'),
('11111111-1111-1111-1111-111111111104', 'Neurologist', 'neurologist', 'Brain', 'Brain disorders, stroke management, epilepsy, headaches, and nerve health.'),
('11111111-1111-1111-1111-111111111105', 'Pediatrician', 'pediatrician', 'ShieldCheck', 'Child healthcare, vaccinations, newborn growth, and pediatric illnesses.'),
('11111111-1111-1111-1111-111111111106', 'Orthopedic Surgeon', 'orthopedic-surgeon', 'Activity', 'Bone fractures, joint replacements, arthritis, spine, and sports injuries.'),
('11111111-1111-1111-1111-111111111107', 'Gastroenterologist', 'gastroenterologist', 'Stethoscope', 'Digestive issues, stomach, liver, endoscopy, and abdominal health.'),
('11111111-1111-1111-1111-111111111108', 'General Physician', 'general-physician', 'UserCheck', 'Primary medical care, fever, diabetes control, blood pressure, and infections.')
ON CONFLICT (slug) DO NOTHING;

-- Insert Cities
INSERT INTO public.cities (id, name, state, country) VALUES
('22222222-2222-2222-2222-222222222201', 'Lahore', 'Punjab', 'Pakistan'),
('22222222-2222-2222-2222-222222222202', 'Karachi', 'Sindh', 'Pakistan'),
('22222222-2222-2222-2222-222222222203', 'Islamabad', 'Islamabad Capital Territory', 'Pakistan'),
('22222222-2222-2222-2222-222222222204', 'Rawalpindi', 'Punjab', 'Pakistan'),
('22222222-2222-2222-2222-222222222205', 'Faisalabad', 'Punjab', 'Pakistan')
ON CONFLICT (name, state) DO NOTHING;

-- Insert Clinics
INSERT INTO public.clinics (id, name, address, city_id, phone, email, opening_hours, image) VALUES
('33333333-3333-3333-3333-333333333301', 'Doctors Hospital & Medical Center', '152-G/1, Canal Bank, Johar Town, Lahore', '22222222-2222-2222-2222-222222222201', '+92 (042) 35302701', 'info@doctorshospital.pk', '24/7 Emergency & OPD (08:00 AM - 10:00 PM)', 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?auto=format&fit=crop&q=80&w=600'),
('33333333-3333-3333-3333-333333333302', 'Aga Khan University Hospital', 'Stadium Road, Karachi', '22222222-2222-2222-2222-222222222202', '+92 (021) 111-911-911', 'contact@akuh.edu.pk', '24/7 Emergency & Consultations', 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=600'),
('33333333-3333-3333-3333-333333333303', 'Shifa International Hospital', 'Sector H-8/4, Islamabad', '22222222-2222-2222-2222-222222222203', '+92 (051) 8463000', 'info@shifa.com.pk', '24/7 Specialized Healthcare', 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=600'),
('33333333-3333-3333-3333-333333333304', 'National Hospital DHA', '132-L, Sector L, Phase 1, DHA Lahore', '22222222-2222-2222-2222-222222222201', '+92 (042) 111-171-819', 'dha@nationalhospital.pk', '08:00 AM - 11:00 PM Daily', 'https://images.unsplash.com/photo-1512678080530-7760d81faba6?auto=format&fit=crop&q=80&w=600')
ON CONFLICT (id) DO NOTHING;

-- Insert Doctors
INSERT INTO public.doctors (
    id, full_name, title, email, phone, avatar_url, specialty_id, city_id, clinic_id,
    experience_years, consultation_fee, rating, review_count, qualifications, bio,
    languages, gender, is_verified, is_featured, registration_number
) VALUES
(
    '44444444-4444-4444-4444-444444444401',
    'Prof. Dr. Tariq Mahmood',
    'Prof. Dr. Tariq Mahmood, FCPS (Cardiology)',
    'dr.tariq@medicare.pk',
    '+92 300 8451122',
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=400',
    '11111111-1111-1111-1111-111111111101',
    '22222222-2222-2222-2222-222222222201',
    '33333333-3333-3333-3333-333333333301',
    18,
    3000.00,
    4.96,
    148,
    ARRAY['MBBS - King Edward Medical University', 'FCPS (Cardiology) - CPSP', 'Fellow Interventional Cardiology (USA)'],
    'Prof. Dr. Tariq Mahmood is a renowned Senior Interventional Cardiologist in Lahore with 18+ years of clinical excellence in angiography, angioplasty, and preventative cardiology.',
    ARRAY['English', 'Urdu', 'Punjabi'],
    'male',
    TRUE,
    TRUE,
    'PMC-48921-P'
),
(
    '44444444-4444-4444-4444-444444444402',
    'Dr. Ayesha Siddiqua',
    'Dr. Ayesha Siddiqua, MCPS, FCPS (Dermatology)',
    'dr.ayesha@medicare.pk',
    '+92 321 4567890',
    'https://images.unsplash.com/photo-1594824813637-280f55f69766?auto=format&fit=crop&q=80&w=400',
    '11111111-1111-1111-1111-111111111102',
    '22222222-2222-2222-2222-222222222202',
    '33333333-3333-3333-3333-333333333302',
    12,
    2500.00,
    4.92,
    116,
    ARRAY['MBBS - Dow University of Health Sciences', 'FCPS (Dermatology) - CPSP', 'Diploma in Aesthetic Medicine (UK)'],
    'Dr. Ayesha Siddiqua is a leading Consultant Dermatologist and Cosmetologist with extensive expertise in acne therapy, melasma, eczema, and advanced clinical skincare.',
    ARRAY['English', 'Urdu', 'Sindhi'],
    'female',
    TRUE,
    TRUE,
    'PMC-61203-S'
),
(
    '44444444-4444-4444-4444-444444444403',
    'Dr. Usman Ali Khan',
    'Dr. Usman Ali Khan, MBBS, MRCP (UK), FCPS',
    'dr.usman@medicare.pk',
    '+92 333 5123987',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=400',
    '11111111-1111-1111-1111-111111111108',
    '22222222-2222-2222-2222-222222222203',
    '33333333-3333-3333-3333-333333333303',
    14,
    2000.00,
    4.89,
    94,
    ARRAY['MBBS - Army Medical College', 'MRCP (Internal Medicine) - UK', 'FCPS (Medicine) - CPSP'],
    'Consultant Internal Medicine & General Physician in Islamabad specializing in diabetic management, hypertensive emergencies, infectious illnesses, and preventative wellness.',
    ARRAY['English', 'Urdu', 'Pashto'],
    'male',
    TRUE,
    TRUE,
    'PMC-52914-I'
)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Doctor Weekly Schedules
INSERT INTO public.doctor_schedules (doctor_id, day_of_week, day_name, is_enabled, start_time, end_time, slot_duration_minutes)
VALUES
('44444444-4444-4444-4444-444444444401', 1, 'Monday', TRUE, '09:00:00', '16:00:00', 20),
('44444444-4444-4444-4444-444444444401', 2, 'Tuesday', TRUE, '09:00:00', '16:00:00', 20),
('44444444-4444-4444-4444-444444444401', 3, 'Wednesday', TRUE, '09:00:00', '16:00:00', 20),
('44444444-4444-4444-4444-444444444401', 4, 'Thursday', TRUE, '09:00:00', '16:00:00', 20),
('44444444-4444-4444-4444-444444444401', 5, 'Friday', TRUE, '09:00:00', '13:00:00', 20)
ON CONFLICT (doctor_id, day_of_week) DO NOTHING;
