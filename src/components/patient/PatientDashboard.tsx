import React, { useState } from 'react';
import { Appointment, Doctor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../common/StatusBadge';
import { updateAppointmentStatus, getDoctors } from '../../lib/storage';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Printer, 
  XCircle, 
  CheckCircle, 
  User, 
  Heart, 
  AlertTriangle, 
  Phone, 
  FileText,
  Building2,
  CalendarCheck2,
  Edit2
} from 'lucide-react';

interface PatientDashboardProps {
  appointments: Appointment[];
  doctors: Doctor[];
  initialTab?: string;
  onNavigate: (view: string, data?: any) => void;
  onOpenPrintSlip: (appointment: Appointment) => void;
  onRefreshData: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  appointments,
  doctors,
  initialTab = 'appointments',
  onNavigate,
  onOpenPrintSlip,
  onRefreshData,
}) => {
  const { user, updateProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<'appointments' | 'profile'>(
    initialTab === 'profile' ? 'profile' : 'appointments'
  );
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [activeTab]);

  // Cancel appointment modal state
  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // Profile edit form state
  const [profileForm, setProfileForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '1988-06-14',
    gender: user?.gender || 'male',
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: (user?.allergies || ['Penicillin']).join(', '),
    emergencyContact: user?.emergencyContact || 'Sarah Miller (+1 212-555-7833)',
    address: user?.address || '142 W 57th St, Apt 8B, New York, NY 10019',
  });
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  // Filter patient's appointments
  const myAppointments = appointments.filter(a => a.patientId === user?.id || a.patientEmail === user?.email);

  const upcomingAppointments = myAppointments.filter(a => a.status === 'confirmed' || a.status === 'pending');
  const completedAppointments = myAppointments.filter(a => a.status === 'completed');
  const cancelledAppointments = myAppointments.filter(a => a.status === 'cancelled' || a.status === 'rejected');

  const displayedAppointments = () => {
    switch (statusFilter) {
      case 'upcoming':
        return upcomingAppointments;
      case 'completed':
        return completedAppointments;
      case 'cancelled':
        return cancelledAppointments;
      case 'all':
      default:
        return myAppointments;
    }
  };

  const handleConfirmCancel = () => {
    if (!cancellingAppointment) return;
    updateAppointmentStatus(cancellingAppointment.id, 'cancelled', {
      cancellationReason: cancelReason || 'Cancelled by patient',
    });
    setCancellingAppointment(null);
    setCancelReason('');
    onRefreshData();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      fullName: profileForm.fullName,
      phone: profileForm.phone,
      dateOfBirth: profileForm.dateOfBirth,
      gender: profileForm.gender as any,
      bloodGroup: profileForm.bloodGroup,
      allergies: profileForm.allergies.split(',').map(s => s.trim()).filter(Boolean),
      emergencyContact: profileForm.emergencyContact,
      address: profileForm.address,
    });
    setProfileSuccessMsg('Medical profile information updated successfully.');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-sky-700 text-white rounded font-bold text-xl flex items-center justify-center">
            {user?.fullName?.charAt(0) || 'P'}
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-sky-700 block">
              Patient Portal
            </span>
            <h1 className="text-xl font-bold text-slate-900">{user?.fullName || 'James Miller'}</h1>
            <p className="text-xs text-slate-500">
              {user?.email} · Contact: {user?.phone || 'Not provided'}
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('search-doctors')}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>Book New Appointment</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Total Bookings</span>
          <span className="text-2xl font-bold font-mono text-slate-900 block mt-1">
            {myAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-sky-700 uppercase block">Upcoming Visits</span>
          <span className="text-2xl font-bold font-mono text-sky-700 block mt-1">
            {upcomingAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase block">Completed Consultations</span>
          <span className="text-2xl font-bold font-mono text-emerald-700 block mt-1">
            {completedAppointments.length}
          </span>
        </div>
        <div className="bg-white p-4 rounded border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-500 uppercase block">Cancelled</span>
          <span className="text-2xl font-bold font-mono text-slate-500 block mt-1">
            {cancelledAppointments.length}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appointments')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'appointments'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>My Consultations & Bookings</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-sky-600 text-sky-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Patient Health Records</span>
        </button>
      </div>

      {/* Tab 1: Appointments List */}
      {activeTab === 'appointments' && (
        <div className="space-y-4">
          {/* Status Sub-filter Bar */}
          <div className="bg-white px-4 py-2.5 rounded border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600">Filter View:</span>
              <button
                onClick={() => setStatusFilter('upcoming')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'upcoming'
                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('completed')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'completed'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Completed ({completedAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('cancelled')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'cancelled'
                    ? 'bg-slate-100 text-slate-800 border border-slate-300'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Cancelled ({cancelledAppointments.length})
              </button>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All ({myAppointments.length})
              </button>
            </div>
          </div>

          {/* Appointment Cards */}
          {displayedAppointments().length > 0 ? (
            <div className="space-y-3">
              {displayedAppointments().map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded shadow-xs p-5 hover:border-slate-300 transition-colors"
                >
                  <div className="flex flex-col md:flex-row items-start justify-between gap-4">
                    {/* Left: Doctor & Schedule */}
                    <div className="flex items-start gap-4">
                      <img
                        src={apt.doctorAvatarUrl}
                        alt={apt.doctorName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <StatusBadge status={apt.status} />
                          <span className="font-mono text-xs font-bold text-sky-700">
                            Token: {apt.tokenNumber}
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-slate-900">
                          {apt.doctorName}
                        </h3>

                        <p className="text-xs text-slate-600">
                          {apt.doctorSpecialty} · {apt.clinicName}
                        </p>

                        <div className="pt-1.5 flex flex-wrap items-center gap-4 text-xs text-slate-700 font-medium">
                          <div className="flex items-center gap-1 text-slate-900">
                            <Calendar className="w-3.5 h-3.5 text-sky-600" />
                            <span>
                              {new Date(apt.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-slate-900">
                            <Clock className="w-3.5 h-3.5 text-sky-600" />
                            <span>{apt.appointmentTime}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{apt.clinicAddress}</span>
                          </div>
                        </div>

                        {/* Reason / Clinical Notes */}
                        <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                          <span className="font-semibold text-slate-700">Visit Reason:</span> {apt.reasonForVisit}
                          {apt.doctorNotes && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-slate-700">
                              <span className="font-semibold text-sky-900">Doctor Note:</span> {apt.doctorNotes}
                            </div>
                          )}
                          {apt.prescriptionSummary && (
                            <div className="mt-1 pt-1 border-t border-slate-200 text-emerald-900 font-mono text-[11px]">
                              <span className="font-sans font-semibold text-slate-700">Prescription:</span> {apt.prescriptionSummary}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="w-full md:w-auto flex md:flex-col items-center md:items-end justify-between gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                      <div className="text-left md:text-right">
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Consultation Fee</span>
                        <span className="text-sm font-bold font-mono text-slate-900 block">
                          Rs. {apt.consultationFee.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-500 block">Pay at Clinic</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenPrintSlip(apt)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print Slip</span>
                        </button>

                        {(apt.status === 'confirmed' || apt.status === 'pending') && (
                          <button
                            type="button"
                            onClick={() => setCancellingAppointment(apt)}
                            className="px-2.5 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 border border-slate-200 rounded text-center">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-800">No appointments found</h3>
              <p className="text-xs text-slate-500 mt-1">
                You do not have any appointments in the "{statusFilter}" filter.
              </p>
              <button
                onClick={() => onNavigate('search-doctors')}
                className="mt-4 px-4 py-2 bg-sky-600 text-white rounded text-xs font-bold shadow-xs"
              >
                Find a Doctor & Book Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Medical Profile Information */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs max-w-3xl">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-600" />
            <span>Patient Identification & Health History</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            This health record is made available to your consulting physician during your medical visit.
          </p>

          {profileSuccessMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={profileForm.fullName}
                  onChange={(e) => setProfileForm({ ...profileForm, fullName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Known Allergies</label>
                <input
                  type="text"
                  value={profileForm.allergies}
                  onChange={(e) => setProfileForm({ ...profileForm, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts, Aspirin, Sulfa drugs"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Emergency Contact Person & Phone</label>
                <input
                  type="text"
                  value={profileForm.emergencyContact}
                  onChange={(e) => setProfileForm({ ...profileForm, emergencyContact: e.target.value })}
                  placeholder="e.g. Sarah Miller (Spouse) - +1 212-555-7833"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                <textarea
                  rows={2}
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                ></textarea>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-xs shadow-xs transition-colors"
              >
                Save Health Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {cancellingAppointment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-300 rounded shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Cancel Appointment?</span>
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you wish to cancel your scheduled appointment (<strong>{cancellingAppointment.tokenNumber}</strong>) with <strong>{cancellingAppointment.doctorName}</strong> on {cancellingAppointment.appointmentDate}?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for cancellation:
              </label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Schedule conflict, illness, no longer needed..."
                className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCancellingAppointment(null)}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
