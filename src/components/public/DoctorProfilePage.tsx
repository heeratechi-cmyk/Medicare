import React, { useState, useMemo } from 'react';
import { Doctor, Review } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { addReview, getAvailableSlotsForDate } from '../../lib/storage';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  Legend
} from 'recharts';
import { 
  Star, 
  MapPin, 
  Building2, 
  CheckCircle2, 
  GraduationCap, 
  Clock, 
  Calendar, 
  Languages, 
  Phone, 
  Mail, 
  ShieldCheck, 
  MessageSquare,
  AlertCircle,
  ThumbsUp,
  TrendingUp,
  Sparkles
} from 'lucide-react';

interface DoctorProfilePageProps {
  doctor: Doctor;
  reviews: Review[];
  onNavigate: (view: string, data?: any) => void;
  onOpenBooking: (doctor: Doctor, initialDate?: string) => void;
  onReviewAdded: () => void;
}

export const DoctorProfilePage: React.FC<DoctorProfilePageProps> = ({
  doctor,
  reviews,
  onNavigate,
  onOpenBooking,
  onReviewAdded,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'schedule' | 'reviews'>('overview');

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [doctor.id, activeTab]);

  // Generate 14-day visual availability forecast using recharts
  const availabilityData = useMemo(() => {
    const today = new Date();
    const data = [];

    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const dayOfWeek = d.getDay();
      const dayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayOfWeek];
      const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()];
      const displayLabel = `${dayShort} ${d.getDate()}`;
      const fullDateLabel = `${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek]}, ${monthShort} ${d.getDate()}, ${year}`;

      const slots = getAvailableSlotsForDate(doctor, dateStr);
      const scheduleDay = doctor.schedules?.find(s => s.dayOfWeek === dayOfWeek);
      const isDayEnabled = Boolean(scheduleDay && scheduleDay.isEnabled);

      // Estimate total slots based on shift hours & duration
      let maxCapacity = 0;
      if (isDayEnabled && scheduleDay) {
        const [sH, sM] = scheduleDay.startTime.split(':').map(Number);
        const [eH, eM] = scheduleDay.endTime.split(':').map(Number);
        const duration = scheduleDay.slotDurationMinutes || 20;
        const totalMinutes = (eH * 60 + eM) - (sH * 60 + sM);
        maxCapacity = Math.max(slots.length, Math.floor(totalMinutes / duration));
      }

      const openSlots = slots.length;
      const bookedSlots = Math.max(0, maxCapacity - openSlots);

      data.push({
        dateStr,
        displayLabel,
        fullDateLabel,
        dayShort,
        openSlots,
        bookedSlots,
        totalCapacity: maxCapacity,
        isOpen: isDayEnabled && openSlots > 0,
        shift: isDayEnabled && scheduleDay ? `${scheduleDay.startTime} - ${scheduleDay.endTime}` : 'Off Day'
      });
    }

    return data;
  }, [doctor]);

  // Availability statistics
  const totalOpenSlots14Days = availabilityData.reduce((acc, curr) => acc + curr.openSlots, 0);
  const nextAvailableDay = availabilityData.find(d => d.isOpen);

  // Review form state
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState('');
  const [visitReason, setVisitReason] = useState('General Consultation');
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please enter your review feedback.');
      return;
    }
    if (!patientName.trim()) {
      setReviewError('Please provide your name.');
      return;
    }

    try {
      addReview({
        doctorId: doctor.id,
        patientId: user?.id || 'guest-' + Date.now(),
        patientName: patientName.trim(),
        rating,
        comment: comment.trim(),
        visitReason,
      });

      setComment('');
      setReviewSubmitted(true);
      setReviewError('');
      onReviewAdded();
      setTimeout(() => setReviewSubmitted(false), 5000);
    } catch (err: any) {
      setReviewError(err.message || 'Failed to submit review.');
    }
  };

  const docReviews = reviews.filter(r => r.doctorId === doctor.id);

  // Custom Chart Tooltip for Recharts
  const CustomChartTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-44">
          <p className="font-bold text-sky-400">{data.fullDateLabel}</p>
          <div className="border-t border-slate-700 pt-1 space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span>Shift Timing:</span>
              <span className="font-mono text-white">{data.shift}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-400 font-semibold">
              <span>Available Slots:</span>
              <span className="font-mono">{data.openSlots} open</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span>Booked Slots:</span>
              <span className="font-mono">{data.bookedSlots}</span>
            </div>
          </div>
          {data.isOpen ? (
            <p className="text-[10px] text-sky-300 pt-1 text-center font-medium bg-sky-950/60 rounded py-0.5 mt-1">
              Click bar to book on this date
            </p>
          ) : (
            <p className="text-[10px] text-amber-300 pt-1 text-center font-medium bg-amber-950/60 rounded py-0.5 mt-1">
              Clinic closed on this date
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <button onClick={() => onNavigate('search-doctors')} className="hover:text-slate-900">
          Doctor Directory
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{doctor.fullName}</span>
      </nav>

      {/* Doctor Header Banner Card */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <img
              src={doctor.avatarUrl}
              alt={doctor.fullName}
              referrerPolicy="no-referrer"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded object-cover border border-slate-200 shrink-0"
            />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 text-xs font-bold uppercase bg-sky-50 text-sky-800 border border-sky-200 rounded">
                  {doctor.specialtyName}
                </span>
                {doctor.isVerified && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Medical License ({doctor.registrationNumber})
                  </span>
                )}
              </div>

              <h1 className="text-2xl font-bold text-slate-900">{doctor.title}</h1>

              <p className="text-xs text-slate-600 font-medium">
                {doctor.experienceYears} Years Clinical Experience · {doctor.cityName}
              </p>

              <div className="flex items-center gap-3 text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  {doctor.rating.toFixed(2)}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 font-medium">{doctor.reviewCount} Verified Patient Reviews</span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-600 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-slate-400" />
                  {doctor.languages.join(', ')}
                </span>
              </div>

              <div className="pt-2 text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{doctor.clinicName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>{doctor.clinicAddress}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick CTA Box */}
          <div className="w-full md:w-64 bg-slate-50 border border-slate-200 rounded p-4 text-center space-y-3 shrink-0">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-500 block">Consultation Fee</span>
              <span className="text-xl font-bold font-mono text-slate-900 block">
                Rs. {doctor.consultationFee.toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-500 block">Pay upon clinic check-in</span>
            </div>

            <button
              onClick={() => onOpenBooking(doctor)}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded text-xs font-bold shadow-xs transition-colors"
            >
              Book Appointment Slot
            </button>

            <p className="text-[11px] text-emerald-700 font-medium flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-emerald-600" />
              <span>Available {doctor.nextAvailableDate}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Doctor Profile & Qualifications
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'schedule'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Weekly Consultation Schedule
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'reviews'
              ? 'border-sky-600 text-sky-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Patient Reviews ({docReviews.length})
        </button>
      </div>

      {/* Tab 1: Overview & Qualifications */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100">
                About {doctor.fullName}
              </h2>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {doctor.bio}
              </p>
            </div>

            {/* Qualifications & Degrees */}
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-sky-600" />
                <span>Education, Board Certifications & Fellowships</span>
              </h2>
              <ul className="space-y-2.5">
                {doctor.qualifications.map((q, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <span className="font-medium">{q}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Clinic Details */}
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-sky-600" />
                <span>Clinic & Hospital Affiliation</span>
              </h2>
              <div className="space-y-2 text-xs text-slate-700">
                <p className="font-bold text-slate-900">{doctor.clinicName}</p>
                <p className="text-slate-600">{doctor.clinicAddress}</p>
                <p className="text-slate-600">Contact: {doctor.phone}</p>
                <p className="text-slate-600">Email: {doctor.email}</p>
              </div>
            </div>
          </div>

          {/* Right Column: Appointment Direct Action */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
                Quick Appointment Booking
              </h3>
              <p className="text-xs text-slate-500">
                Choose your consultation date and pick an open slot to generate your hospital visit token.
              </p>

              <div className="bg-sky-50 border border-sky-200 rounded p-3 text-xs text-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Specialty:</span>
                  <span className="font-semibold">{doctor.specialtyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fee:</span>
                  <span className="font-bold font-mono">Rs. {doctor.consultationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Slot Duration:</span>
                  <span>30 minutes</span>
                </div>
              </div>

              <button
                onClick={() => onOpenBooking(doctor)}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold shadow-xs transition-colors"
              >
                Proceed to Book Slot →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Weekly Schedule & Recharts Visual Availability Forecast */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          {/* Recharts Visual Availability Forecast */}
          <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-600" />
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Visual Availability Calendar (Next 14 Days)
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Interactive real-time slot chart. Click any day bar to reserve an instant token.
                </p>
              </div>

              {/* KPI Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded text-xs font-semibold">
                  {totalOpenSlots14Days} Open Slots Available
                </span>
                {nextAvailableDay && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-xs font-semibold">
                    Earliest: {nextAvailableDay.displayLabel}
                  </span>
                )}
              </div>
            </div>

            {/* Recharts BarChart Container */}
            <div className="h-64 sm:h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={availabilityData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                  onClick={(e: any) => {
                    if (e && e.activePayload && e.activePayload.length) {
                      const clickedItem = e.activePayload[0].payload;
                      if (clickedItem.isOpen) {
                        onOpenBooking(doctor, clickedItem.dateStr);
                      }
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="displayLabel"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomChartTooltip />} />
                  <Legend
                    verticalAlign="top"
                    align="right"
                    wrapperStyle={{ fontSize: 11, paddingBottom: '10px' }}
                  />
                  <Bar
                    name="Available Slots"
                    dataKey="openSlots"
                    radius={[4, 4, 0, 0]}
                    className="cursor-pointer transition-opacity hover:opacity-85"
                  >
                    {availabilityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.isOpen ? '#0284c7' : '#cbd5e1'}
                      />
                    ))}
                  </Bar>
                  <Bar
                    name="Booked Slots"
                    dataKey="bookedSlots"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick-Pick 14-Day Date Tiles */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Quick-Select Day & Slot Count
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {availabilityData.map((d) => (
                  <button
                    key={d.dateStr}
                    disabled={!d.isOpen}
                    onClick={() => onOpenBooking(doctor, d.dateStr)}
                    className={`p-2.5 rounded border text-left transition-all text-xs flex flex-col justify-between ${
                      d.isOpen
                        ? 'bg-white border-slate-200 hover:border-sky-500 hover:shadow-xs cursor-pointer'
                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-800 text-[11px]">{d.displayLabel}</span>
                      {d.isOpen ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <div>
                      <span className={`block font-bold text-xs ${d.isOpen ? 'text-sky-700' : 'text-slate-500'}`}>
                        {d.isOpen ? `${d.openSlots} Open` : 'Off'}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {d.shift}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Regular Weekly Shift Timetable */}
          <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 pb-2 border-b border-slate-100">
              Standard Weekly OPD Shift Timetable
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="py-2.5 px-4">Day</th>
                    <th className="py-2.5 px-4">Consultation Shift</th>
                    <th className="py-2.5 px-4">Slot Interval</th>
                    <th className="py-2.5 px-4">Break Time</th>
                    <th className="py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {doctor.schedules.map((s) => (
                    <tr key={s.dayOfWeek} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-900">{s.dayName}</td>
                      <td className="py-2.5 px-4 font-mono">
                        {s.isEnabled ? `${s.startTime} - ${s.endTime}` : '—'}
                      </td>
                      <td className="py-2.5 px-4">
                        {s.isEnabled ? `${s.slotDurationMinutes} mins` : '—'}
                      </td>
                      <td className="py-2.5 px-4 font-mono">
                        {s.breakStartTime && s.breakEndTime ? `${s.breakStartTime} - ${s.breakEndTime}` : 'None'}
                      </td>
                      <td className="py-2.5 px-4">
                        {s.isEnabled ? (
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded text-[10px] font-bold">
                            AVAILABLE
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-200 rounded text-[10px] font-medium">
                            OFF DAY
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Reviews & Write Review */}
      {activeTab === 'reviews' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100">
              Verified Feedback ({docReviews.length})
            </h2>

            {docReviews.length > 0 ? (
              <div className="space-y-4">
                {docReviews.map((r) => (
                  <div key={r.id} className="bg-white p-5 rounded border border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{r.patientName}</span>
                        <span className="text-[11px] text-slate-400">{r.visitReason}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500">
                        {[...Array(r.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed italic">
                      "{r.comment}"
                    </p>
                    <span className="text-[10px] text-slate-400 block mt-2">
                      Reviewed on {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 bg-white border border-slate-200 rounded text-center text-xs text-slate-500">
                No patient reviews yet for this doctor. Be the first to review!
              </div>
            )}
          </div>

          {/* Write Review Form */}
          <div>
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-100 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-600" />
                <span>Write a Patient Review</span>
              </h3>

              {reviewSubmitted && (
                <div className="p-2.5 mb-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800">
                  Thank you! Your verified review has been submitted and published.
                </div>
              )}

              {reviewError && (
                <div className="p-2.5 mb-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Robert Davis"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setRating(num)}
                        className={`p-1.5 rounded border transition-colors ${
                          rating >= num
                            ? 'bg-amber-50 border-amber-300 text-amber-500'
                            : 'bg-slate-50 border-slate-200 text-slate-400'
                        }`}
                      >
                        <Star className="w-4 h-4 fill-current" />
                      </button>
                    ))}
                    <span className="font-bold text-slate-800 ml-1">{rating} / 5 Stars</span>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reason for Visit</label>
                  <input
                    type="text"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder="e.g. Cardiology Checkup"
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Your Review & Comments</label>
                  <textarea
                    rows={3}
                    required
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe your clinical consultation experience..."
                    className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-xs shadow-xs transition-colors"
                >
                  Submit Verified Review
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
