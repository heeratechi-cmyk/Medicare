import React, { useState } from 'react';
import { Doctor, Appointment, DoctorScheduleDay } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { 
  updateAppointmentStatus, 
  saveDoctor, 
  updateDoctorSchedule,
  getDoctorByUserId,
  getDoctors
} from '../../lib/storage';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  FileText, 
  User, 
  Settings, 
  Edit3, 
  Save, 
  Users, 
  Star, 
  Building2,
  Stethoscope,
  AlertCircle,
  Plus,
  Trash2,
  Phone,
  Mail,
  Printer
} from 'lucide-react';

interface DoctorDashboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  onNavigate: (view: string, data?: any) => void;
  onOpenPrintSlip: (appointment: Appointment) => void;
  onRefreshData: () => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({
  appointments,
  doctors,
  onNavigate,
  onOpenPrintSlip,
  onRefreshData,
}) => {
  const { user } = useAuth();
  
  // Find logged in doctor or default to Dr. Arthur Vance
  const currentDoctor = doctors.find(d => d.userId === user?.id || d.email === user?.email) || doctors[0];

  const [activeTab, setActiveTab] = useState<'appointments' | 'schedule' | 'profile' | 'patients'>('appointments');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [activeTab]);
  
  // Clinical notes modal state
  const [selectedAppointmentForNote, setSelectedAppointmentForNote] = useState<Appointment | null>(null);
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [prescriptionSummary, setPrescriptionSummary] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Reschedule state
  const [reschedulingAppointment, setReschedulingAppointment] = useState<Appointment | null>(null);
  const [newRescheduleDate, setNewRescheduleDate] = useState('');
  const [newRescheduleTime, setNewRescheduleTime] = useState('11:00 AM');

  // Schedule editor state
  const [schedules, setSchedules] = useState<DoctorScheduleDay[]>(currentDoctor.schedules || []);
  const [scheduleSaveSuccess, setScheduleSaveSuccess] = useState(false);

  // Profile editor state
  const [profileForm, setProfileForm] = useState({
    title: currentDoctor.title,
    experienceYears: currentDoctor.experienceYears,
    consultationFee: currentDoctor.consultationFee,
    bio: currentDoctor.bio,
    clinicName: currentDoctor.clinicName,
    clinicAddress: currentDoctor.clinicAddress,
    qualifications: currentDoctor.qualifications.join('\n'),
    languages: currentDoctor.languages.join(', '),
  });
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  // Doctor's appointments
  const doctorAppointments = appointments.filter(a => a.doctorId === currentDoctor.id || a.doctorName.includes(currentDoctor.fullName));
  
  const pendingAppointments = doctorAppointments.filter(a => a.status === 'pending');
  const confirmedAppointments = doctorAppointments.filter(a => a.status === 'confirmed');
  const completedAppointments = doctorAppointments.filter(a => a.status === 'completed');

  const filteredAppointments = doctorAppointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const handleStatusChange = (appointmentId: string, status: 'confirmed' | 'completed' | 'rejected') => {
    updateAppointmentStatus(appointmentId, status);
    setActionSuccessMsg(`Appointment status updated to ${status.toUpperCase()}`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
    onRefreshData();
  };

  const handleSaveClinicalNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointmentForNote) return;
    updateAppointmentStatus(selectedAppointmentForNote.id, 'completed', {
      doctorNotes: clinicalNotes,
      prescriptionSummary: prescriptionSummary,
    });
    setSelectedAppointmentForNote(null);
    setActionSuccessMsg('Clinical consultation notes & prescription saved!');
    setTimeout(() => setActionSuccessMsg(''), 3500);
    onRefreshData();
  };

  const handleConfirmReschedule = () => {
    if (!reschedulingAppointment || !newRescheduleDate) return;
    updateAppointmentStatus(reschedulingAppointment.id, 'confirmed', {
      newDate: newRescheduleDate,
      newTime: newRescheduleTime,
    });
    setReschedulingAppointment(null);
    setActionSuccessMsg('Appointment rescheduled successfully!');
    setTimeout(() => setActionSuccessMsg(''), 3500);
    onRefreshData();
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedules(prev =>
      prev.map(s => (s.dayOfWeek === dayOfWeek ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const handleUpdateScheduleDay = (dayOfWeek: number, field: keyof DoctorScheduleDay, value: any) => {
    setSchedules(prev =>
      prev.map(s => (s.dayOfWeek === dayOfWeek ? { ...s, [field]: value } : s))
    );
  };

  const handleSaveSchedules = () => {
    updateDoctorSchedule(currentDoctor.id, schedules);
    setScheduleSaveSuccess(true);
    setTimeout(() => setScheduleSaveSuccess(false), 4000);
    onRefreshData();
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveDoctor({
      id: currentDoctor.id,
      title: profileForm.title,
      experienceYears: Number(profileForm.experienceYears),
      consultationFee: Number(profileForm.consultationFee),
      bio: profileForm.bio,
      clinicName: profileForm.clinicName,
      clinicAddress: profileForm.clinicAddress,
      qualifications: profileForm.qualifications.split('\n').filter(s => s.trim().length > 0),
      languages: profileForm.languages.split(',').map(s => s.trim()).filter(Boolean),
    });
    setProfileSaveSuccess(true);
    setTimeout(() => setProfileSaveSuccess(false), 4000);
    onRefreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <img
            src={currentDoctor.avatarUrl}
            alt={currentDoctor.fullName}
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded object-cover border border-slate-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded">
                Doctor Panel
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Reg: {currentDoctor.registrationNumber}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">{currentDoctor.title}</h1>
            <p className="text-xs text-slate-500">
              {currentDoctor.specialtyName} · {currentDoctor.clinicName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('doctor-profile', { doctorId: currentDoctor.id })}
            className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
          >
            Preview Public Profile
          </button>
        </div>
      </div>

      {/* Action success alert */}
      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Appointments</span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
            {doctorAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-amber-700 uppercase block">Pending Approvals</span>
          <span className="text-2xl font-bold font-mono text-amber-700 block mt-1">
            {pendingAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-sky-700 uppercase block">Confirmed Queue</span>
          <span className="text-2xl font-bold font-mono text-sky-700 block mt-1">
            {confirmedAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Rating / Reviews</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1 flex items-center gap-1">
            <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
            {currentDoctor.rating.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Patient Appointments ({doctorAppointments.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'schedule'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Weekly Schedule & Slot Availability</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-teal-700 text-teal-800 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Edit3 className="w-4 h-4" />
          <span>Profile & Clinic Details</span>
        </button>
      </div>

      {/* Tab 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          <div className="bg-white px-4 py-3 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Filter:</span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({doctorAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('pending')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'pending' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Pending Requests ({pendingAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('confirmed')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'confirmed' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Confirmed ({confirmedAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'completed' ? 'bg-sky-100 text-sky-900 border border-sky-300' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completed ({completedAppointments.length})
              </button>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="overflow-x-auto bg-white border border-slate-200 rounded shadow-xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                    <th className="py-3 px-4">Token & Patient</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Visit Reason / Symptoms</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span className="font-mono font-bold text-sky-700 block">{apt.tokenNumber}</span>
                        <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                        <span className="text-[11px] text-slate-400 block">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="font-mono text-slate-600 block">{apt.appointmentTime}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-slate-800 block">{apt.reasonForVisit}</span>
                        {apt.symptoms && (
                          <span className="text-[11px] text-slate-500 italic block">
                            Notes: {apt.symptoms}
                          </span>
                        )}
                        {apt.doctorNotes && (
                          <span className="text-[10px] text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded block mt-1">
                            Rx Added
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        {apt.consultationType}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={apt.status} />
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => onOpenPrintSlip(apt)}
                            title="Print Token Slip"
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {apt.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'confirmed')}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded shadow-xs"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleStatusChange(apt.id, 'rejected')}
                                className="px-2 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {apt.status === 'confirmed' && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedAppointmentForNote(apt);
                                  setClinicalNotes(apt.doctorNotes || '');
                                  setPrescriptionSummary(apt.prescriptionSummary || '');
                                }}
                                className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded shadow-xs"
                              >
                                Complete & Rx
                              </button>
                              <button
                                onClick={() => {
                                  setReschedulingAppointment(apt);
                                  setNewRescheduleDate(apt.appointmentDate);
                                  setNewRescheduleTime(apt.appointmentTime);
                                }}
                                className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded"
                              >
                                Reschedule
                              </button>
                            </>
                          )}

                          {apt.status === 'completed' && (
                            <button
                              onClick={() => {
                                setSelectedAppointmentForNote(apt);
                                setClinicalNotes(apt.doctorNotes || '');
                                setPrescriptionSummary(apt.prescriptionSummary || '');
                              }}
                              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded"
                            >
                              Edit Notes
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-white p-12 border border-slate-200 rounded text-center text-xs text-slate-500">
              No appointments found for the selected filter.
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Weekly Schedule Manager */}
      {activeTab === 'schedule' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Weekly Consultation Hours & Shift Manager
              </h2>
              <p className="text-xs text-slate-500">
                Configure your operating days, appointment slot duration, and lunch/break times for patient reservations.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSaveSchedules}
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Schedule Changes</span>
            </button>
          </div>

          {scheduleSaveSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Weekly availability schedule saved successfully!</span>
            </div>
          )}

          <div className="space-y-3">
            {schedules.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded border transition-colors ${
                  day.isEnabled ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/60 border-slate-200 opacity-60'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center text-xs">
                  {/* Day Toggle */}
                  <div className="md:col-span-1 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`day-${day.dayOfWeek}`}
                      checked={day.isEnabled}
                      onChange={() => handleToggleDay(day.dayOfWeek)}
                      className="rounded text-teal-700 focus:ring-teal-600"
                    />
                    <label htmlFor={`day-${day.dayOfWeek}`} className="font-bold text-slate-900 cursor-pointer">
                      {day.dayName}
                    </label>
                  </div>

                  {/* Start / End Time */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block">Start</span>
                      <input
                        type="time"
                        disabled={!day.isEnabled}
                        value={day.startTime}
                        onChange={(e) => handleUpdateScheduleDay(day.dayOfWeek, 'startTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <span className="mt-4 text-slate-400">-</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block">End</span>
                      <input
                        type="time"
                        disabled={!day.isEnabled}
                        value={day.endTime}
                        onChange={(e) => handleUpdateScheduleDay(day.dayOfWeek, 'endTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div className="md:col-span-1">
                    <span className="text-[10px] text-slate-500 block">Slot Length</span>
                    <select
                      disabled={!day.isEnabled}
                      value={day.slotDurationMinutes}
                      onChange={(e) => handleUpdateScheduleDay(day.dayOfWeek, 'slotDurationMinutes', Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-teal-700"
                    >
                      <option value="15">15 mins</option>
                      <option value="20">20 mins</option>
                      <option value="30">30 mins</option>
                      <option value="45">45 mins</option>
                      <option value="60">60 mins</option>
                    </select>
                  </div>

                  {/* Break Time */}
                  <div className="md:col-span-2 flex items-center gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block">Break Start</span>
                      <input
                        type="time"
                        disabled={!day.isEnabled}
                        value={day.breakStartTime || ''}
                        onChange={(e) => handleUpdateScheduleDay(day.dayOfWeek, 'breakStartTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                    <span className="mt-4 text-slate-400">-</span>
                    <div className="flex-1">
                      <span className="text-[10px] text-slate-500 block">Break End</span>
                      <input
                        type="time"
                        disabled={!day.isEnabled}
                        value={day.breakEndTime || ''}
                        onChange={(e) => handleUpdateScheduleDay(day.dayOfWeek, 'breakEndTime', e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none focus:border-teal-700"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Profile & Clinic Editor */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs max-w-3xl">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-teal-700" />
            <span>Doctor Profile & Clinic Information</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Keep your credentials, consultation fee, and clinic location accurate for patients.
          </p>

          {profileSaveSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Doctor profile details updated successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Title & Suffix</label>
                <input
                  type="text"
                  required
                  value={profileForm.title}
                  onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                  placeholder="Dr. Arthur Vance, MD, FACC"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Years of Clinical Experience</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  required
                  value={profileForm.experienceYears}
                  onChange={(e) => setProfileForm({ ...profileForm, experienceYears: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Consultation Fee (PKR / Rs.) <span className="text-[10px] text-slate-400">(Payable at clinic desk)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  required
                  value={profileForm.consultationFee}
                  onChange={(e) => setProfileForm({ ...profileForm, consultationFee: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Languages Spoken</label>
                <input
                  type="text"
                  value={profileForm.languages}
                  onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })}
                  placeholder="English, Spanish, French"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Clinic / Hospital Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.clinicName}
                  onChange={(e) => setProfileForm({ ...profileForm, clinicName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Clinic Physical Address</label>
                <input
                  type="text"
                  required
                  value={profileForm.clinicAddress}
                  onChange={(e) => setProfileForm({ ...profileForm, clinicAddress: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Education, Board Certifications & Degrees (One per line)
                </label>
                <textarea
                  rows={4}
                  value={profileForm.qualifications}
                  onChange={(e) => setProfileForm({ ...profileForm, qualifications: e.target.value })}
                  placeholder="MBBS - Harvard Medical School&#10;MD - Cardiology, Johns Hopkins University"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-mono text-xs focus:outline-none focus:border-teal-700"
                ></textarea>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Professional Bio & Practice Summary</label>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded font-bold text-xs shadow-xs transition-colors"
              >
                Save Doctor Profile
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Clinical Notes & Prescription Modal */}
      {selectedAppointmentForNote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded shadow-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-700" />
              <span>Clinical Notes & Prescription ({selectedAppointmentForNote.tokenNumber})</span>
            </h3>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-200 text-xs space-y-1">
              <p><strong>Patient:</strong> {selectedAppointmentForNote.patientName}</p>
              <p><strong>Reason for Visit:</strong> {selectedAppointmentForNote.reasonForVisit}</p>
            </div>

            <form onSubmit={handleSaveClinicalNotes} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Diagnosis & Consultation Notes</label>
                <textarea
                  rows={3}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Record diagnostic findings, observations, vital signs..."
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-teal-700"
                ></textarea>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Prescription & Medical Recommendations</label>
                <textarea
                  rows={4}
                  value={prescriptionSummary}
                  onChange={(e) => setPrescriptionSummary(e.target.value)}
                  placeholder="1. Medication Name 50mg (1 tablet daily)&#10;2. Lifestyle advice & follow up in 30 days..."
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 font-mono focus:outline-none focus:border-teal-700"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedAppointmentForNote(null)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded shadow-xs"
                >
                  Save & Complete Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <span>Reschedule Appointment ({reschedulingAppointment.tokenNumber})</span>
            </h3>

            <p className="text-xs text-slate-600">
              Select a new date and time for <strong>{reschedulingAppointment.patientName}</strong>:
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Date</label>
                <input
                  type="date"
                  value={newRescheduleDate}
                  onChange={(e) => setNewRescheduleDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Time Slot</label>
                <input
                  type="text"
                  value={newRescheduleTime}
                  onChange={(e) => setNewRescheduleTime(e.target.value)}
                  placeholder="e.g. 10:30 AM"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setReschedulingAppointment(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="px-4 py-1.5 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded shadow-xs"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
