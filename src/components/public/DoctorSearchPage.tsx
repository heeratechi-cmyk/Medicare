import React, { useState, useMemo } from 'react';
import { Doctor, Specialty, City, FilterParams } from '../../types';
import { 
  Search, 
  MapPin, 
  Filter, 
  Star, 
  Building2, 
  RotateCcw, 
  SlidersHorizontal,
  Clock,
  Stethoscope
} from 'lucide-react';

interface DoctorSearchPageProps {
  doctors: Doctor[];
  specialties: Specialty[];
  cities: City[];
  initialFilters?: FilterParams;
  onNavigate: (view: string, data?: any) => void;
  onOpenBooking: (doctor: Doctor) => void;
}

export const DoctorSearchPage: React.FC<DoctorSearchPageProps> = ({
  doctors,
  specialties,
  cities,
  initialFilters = {},
  onNavigate,
  onOpenBooking,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialFilters.searchQuery || '');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialFilters.specialtyId || '');
  const [selectedCity, setSelectedCity] = useState(initialFilters.cityId || '');
  const [selectedGender, setSelectedGender] = useState(initialFilters.gender || 'all');
  const [maxFee, setMaxFee] = useState<number>(initialFilters.maxFee || 5000);
  const [availableTodayOnly, setAvailableTodayOnly] = useState(Boolean(initialFilters.availableTodayOnly));
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'experience' | 'fee_asc' | 'fee_desc'>('recommended');
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filtered and sorted doctor list
  const filteredDoctors = useMemo(() => {
    let list = [...doctors];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        d =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialtyName.toLowerCase().includes(q) ||
          d.clinicName.toLowerCase().includes(q) ||
          d.cityName.toLowerCase().includes(q) ||
          d.bio.toLowerCase().includes(q)
      );
    }

    if (selectedSpecialty) {
      list = list.filter(d => d.specialtyId === selectedSpecialty);
    }

    if (selectedCity) {
      list = list.filter(d => d.cityId === selectedCity);
    }

    if (selectedGender !== 'all') {
      list = list.filter(d => d.gender === selectedGender);
    }

    if (maxFee < 5000) {
      list = list.filter(d => d.consultationFee <= maxFee);
    }

    if (availableTodayOnly) {
      list = list.filter(d => d.availableToday);
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        list.sort((a, b) => b.experienceYears - a.experienceYears);
        break;
      case 'fee_asc':
        list.sort((a, b) => a.consultationFee - b.consultationFee);
        break;
      case 'fee_desc':
        list.sort((a, b) => b.consultationFee - a.consultationFee);
        break;
      case 'recommended':
      default:
        list.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0) || b.rating - a.rating);
        break;
    }

    return list;
  }, [doctors, searchQuery, selectedSpecialty, selectedCity, selectedGender, maxFee, availableTodayOnly, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedSpecialty('');
    setSelectedCity('');
    setSelectedGender('all');
    setMaxFee(5000);
    setAvailableTodayOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Doctor Directory</span>
      </nav>

      {/* Top Search Bar */}
      <div className="bg-white p-4 rounded border border-slate-200">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by doctor name, specialty, or clinic..."
              className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
              className="lg:hidden flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-slate-100 border border-slate-300 rounded text-xs font-semibold text-slate-700"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Filter Sidebar */}
        <aside className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-4`}>
          <div className="bg-white p-4 rounded border border-slate-200 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px]">
                <Filter className="w-3.5 h-3.5 text-sky-600" />
                <span>Filters</span>
              </span>
              <button
                onClick={handleResetFilters}
                className="text-[11px] text-sky-600 hover:underline"
              >
                Clear all
              </button>
            </div>

            {/* Specialty */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
              >
                <option value="">All Specialties</option>
                {specialties.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                City / Location
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                <input
                  type="checkbox"
                  checked={availableTodayOnly}
                  onChange={(e) => setAvailableTodayOnly(e.target.checked)}
                  className="rounded text-sky-600"
                />
                <span className="text-emerald-700">Available Today</span>
              </label>
            </div>

            {/* Doctor Gender */}
            <div className="pt-2 border-t border-slate-100">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Gender
              </label>
              <div className="space-y-1">
                {['all', 'male', 'female'].map((g) => (
                  <label key={g} className="flex items-center gap-2 text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="doctor_gender"
                      checked={selectedGender === g}
                      onChange={() => setSelectedGender(g)}
                      className="text-sky-600"
                    />
                    <span className="capitalize">{g === 'all' ? 'All Genders' : `${g} Doctor`}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Max Fee */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center mb-1">
                <label className="font-semibold text-slate-700">
                  Max Fee
                </label>
                <span className="font-bold text-slate-900 font-mono">
                  Rs. {maxFee.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="1000"
                max="5000"
                step="200"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Rs. 1,000</span>
                <span>Rs. 5,000</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-3">
          {/* Top Sort Bar */}
          <div className="bg-white px-3.5 py-2.5 rounded border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
            <div className="text-slate-600">
              Found <strong className="text-slate-900 font-mono">{filteredDoctors.length}</strong> available doctors
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:border-sky-600 font-medium"
              >
                <option value="recommended">Featured</option>
                <option value="rating">Highest Rated</option>
                <option value="experience">Most Experienced</option>
                <option value="fee_asc">Fee: Low to High</option>
                <option value="fee_desc">Fee: High to Low</option>
              </select>
            </div>
          </div>

          {/* Doctor Cards */}
          {filteredDoctors.length > 0 ? (
            <div className="space-y-3">
              {filteredDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded p-4 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    {/* Left: Info */}
                    <div className="flex items-start gap-3.5 min-w-0">
                      <img
                        src={doc.avatarUrl}
                        alt={doc.fullName}
                        referrerPolicy="no-referrer"
                        className="w-18 h-18 sm:w-20 sm:h-20 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 text-[10px] font-bold text-sky-800 bg-sky-50 border border-sky-200 rounded">
                            {doc.specialtyName}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {doc.registrationNumber}
                          </span>
                        </div>

                        <h2 className="text-sm sm:text-base font-bold text-slate-900">
                          <button
                            onClick={() => onNavigate('doctor-profile', { doctorId: doc.id })}
                            className="hover:text-sky-600 text-left transition-colors"
                          >
                            {doc.fullName}
                          </button>
                        </h2>

                        <p className="text-xs text-slate-600">
                          {doc.qualifications.join(' · ')}
                        </p>

                        <div className="flex items-center gap-2 text-xs pt-0.5">
                          <span className="font-bold text-slate-900 flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            {doc.rating.toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-[11px]">({doc.reviewCount} reviews)</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-slate-600 text-[11px] font-medium">{doc.experienceYears} Years Experience</span>
                        </div>

                        <div className="pt-1 text-xs text-slate-600 flex items-center gap-1.5 truncate">
                          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{doc.clinicName} — {doc.cityName}</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Fee & CTAs */}
                    <div className="w-full sm:w-auto sm:text-right flex sm:flex-col justify-between items-center sm:items-end gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div>
                        <span className="text-[10px] uppercase text-slate-400 font-semibold block">Fee</span>
                        <span className="text-base font-bold text-slate-900 font-mono block">
                          Rs. {doc.consultationFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Pay at Clinic</span>
                      </div>

                      <div className="flex items-center sm:flex-col gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => onOpenBooking(doc)}
                          className="flex-1 sm:w-32 py-1.5 px-3 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded text-center transition-colors"
                        >
                          Book Slot
                        </button>
                        <button
                          onClick={() => onNavigate('doctor-profile', { doctorId: doc.id })}
                          className="flex-1 sm:w-32 py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded text-center transition-colors"
                        >
                          View Profile
                        </button>
                      </div>

                      <div className="hidden sm:block text-[11px] text-emerald-700 font-medium">
                        <Clock className="w-3 h-3 inline mr-1" />
                        <span>Available {doc.nextAvailableDate}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded p-8 text-center text-xs text-slate-500">
              <Stethoscope className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-800">No doctors match your filters</p>
              <button
                onClick={handleResetFilters}
                className="mt-3 px-3 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
