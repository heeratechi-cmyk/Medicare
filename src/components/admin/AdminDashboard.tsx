import React, { useState } from 'react';
import { 
  Doctor, 
  Appointment, 
  Specialty, 
  City, 
  Review, 
  ActivityLog, 
  SiteSettings, 
  UserProfile 
} from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { 
  toggleDoctorVerification, 
  toggleDoctorFeatured, 
  saveSpecialty, 
  deleteSpecialty,
  saveCity,
  deleteCity,
  updateAppointmentStatus,
  toggleReviewApproval,
  deleteReview,
  saveSiteSettings,
  getUsers
} from '../../lib/storage';
import { 
  ShieldCheck, 
  Users, 
  Stethoscope, 
  Calendar, 
  Star, 
  Settings, 
  Activity, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Edit2, 
  FileText, 
  Building2, 
  MapPin, 
  AlertCircle,
  Save,
  Search,
  Filter
} from 'lucide-react';

interface AdminDashboardProps {
  doctors: Doctor[];
  appointments: Appointment[];
  specialties: Specialty[];
  cities: City[];
  reviews: Review[];
  activityLogs: ActivityLog[];
  siteSettings: SiteSettings;
  onRefreshData: () => void;
  onNavigate: (view: string, data?: any) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  doctors,
  appointments,
  specialties,
  cities,
  reviews,
  activityLogs,
  siteSettings,
  onRefreshData,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'doctors' | 'patients' | 'appointments' | 'specialties' | 'reviews' | 'logs' | 'settings'
  >('overview');

  React.useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
  }, [activeTab]);

  const [notification, setNotification] = useState('');
  const allPatients = getUsers().filter(u => u.role === 'patient');

  // New Specialty Form Modal
  const [isAddingSpecialty, setIsAddingSpecialty] = useState(false);
  const [specName, setSpecName] = useState('');
  const [specDesc, setSpecDesc] = useState('');

  // New City Form Modal
  const [isAddingCity, setIsAddingCity] = useState(false);
  const [cityName, setCityName] = useState('');
  const [cityState, setCityState] = useState('');

  // Settings state
  const [settingsForm, setSettingsForm] = useState<SiteSettings>(siteSettings);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
    onRefreshData();
  };

  const handleToggleVerifyDoctor = (docId: string, current: boolean) => {
    toggleDoctorVerification(docId, !current);
    showNotification(`Doctor license verification set to ${!current ? 'APPROVED' : 'PENDING'}`);
  };

  const handleToggleFeaturedDoctor = (docId: string, current: boolean) => {
    toggleDoctorFeatured(docId, !current);
    showNotification(`Doctor featured status updated.`);
  };

  const handleSaveNewSpecialty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!specName.trim()) return;
    saveSpecialty({
      name: specName.trim(),
      slug: specName.trim().toLowerCase().replace(/\s+/g, '-'),
      iconName: 'Activity',
      description: specDesc.trim() || 'Medical specialty department',
    });
    setSpecName('');
    setSpecDesc('');
    setIsAddingSpecialty(false);
    showNotification('New medical specialty created successfully.');
  };

  const handleDeleteSpecialty = (id: string) => {
    if (confirm('Are you sure you want to delete this specialty department?')) {
      deleteSpecialty(id);
      showNotification('Specialty removed.');
    }
  };

  const handleSaveNewCity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityName.trim()) return;
    saveCity({
      name: cityName.trim(),
      state: cityState.trim().toUpperCase() || 'USA',
      country: 'United States',
    });
    setCityName('');
    setCityState('');
    setIsAddingCity(false);
    showNotification('City/Location added to network.');
  };

  const handleDeleteCity = (id: string) => {
    if (confirm('Delete this location?')) {
      deleteCity(id);
      showNotification('City removed.');
    }
  };

  const handleToggleReview = (revId: string, current: boolean) => {
    toggleReviewApproval(revId, !current);
    showNotification(`Review status updated.`);
  };

  const handleDeleteReview = (revId: string) => {
    deleteReview(revId);
    showNotification('Review deleted.');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    saveSiteSettings(settingsForm);
    showNotification('Platform website settings saved successfully.');
  };

  const verifiedDoctorsCount = doctors.filter(d => d.isVerified).length;
  const pendingDoctorsCount = doctors.filter(d => !d.isVerified).length;
  const pendingAppointmentsCount = appointments.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Admin Top Header */}
      <div className="bg-slate-900 text-white rounded p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-sky-600 rounded flex items-center justify-center font-bold text-xl">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                Administration Console
              </span>
              <span className="text-xs text-slate-400">MediCare System Manager</span>
            </div>
            <h1 className="text-xl font-bold text-white mt-0.5">Central Healthcare Control Panel</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('home')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
          >
            Visit Public Website
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <div className="bg-white border border-slate-200 rounded p-1.5 flex flex-wrap gap-1 text-xs font-semibold text-slate-700 shadow-xs">
        {[
          { id: 'overview', label: 'System Overview', icon: Activity },
          { id: 'doctors', label: `Manage Doctors (${doctors.length})`, icon: Stethoscope },
          { id: 'patients', label: `Patients (${allPatients.length})`, icon: Users },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
          { id: 'specialties', label: 'Specialties & Cities', icon: Building2 },
          { id: 'reviews', label: `Reviews (${reviews.length})`, icon: Star },
          { id: 'logs', label: 'Audit Logs', icon: FileText },
          { id: 'settings', label: 'Website Settings', icon: Settings },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded flex items-center gap-1.5 transition-colors ${
                isActive ? 'bg-slate-900 text-white shadow-xs' : 'hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. System Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Numbers Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Doctors</span>
              <span className="text-3xl font-bold font-mono text-slate-900 block mt-1">
                {doctors.length}
              </span>
              <span className="text-[11px] text-emerald-700 mt-1 block">
                {verifiedDoctorsCount} Verified · {pendingDoctorsCount} Pending
              </span>
            </div>

            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Total Bookings</span>
              <span className="text-3xl font-bold font-mono text-sky-700 block mt-1">
                {appointments.length}
              </span>
              <span className="text-[11px] text-amber-700 mt-1 block">
                {pendingAppointmentsCount} Pending Approvals
              </span>
            </div>

            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Registered Patients</span>
              <span className="text-3xl font-bold font-mono text-slate-900 block mt-1">
                {allPatients.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">Active Healthcare Records</span>
            </div>

            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Medical Specialties</span>
              <span className="text-3xl font-bold font-mono text-teal-700 block mt-1">
                {specialties.length}
              </span>
              <span className="text-[11px] text-slate-400 mt-1 block">{cities.length} Service Cities</span>
            </div>
          </div>

          {/* Quick Doctor Verifications & Recent Bookings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctors Awaiting Approval */}
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Doctor License Verification Status</span>
                <span className="text-[11px] text-sky-700 font-semibold cursor-pointer" onClick={() => setActiveTab('doctors')}>
                  View All →
                </span>
              </h3>

              <div className="mt-3 divide-y divide-slate-100">
                {doctors.slice(0, 4).map((doc) => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900 block">{doc.fullName}</span>
                      <span className="text-slate-500 text-[11px]">
                        {doc.specialtyName} · Reg #{doc.registrationNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleVerifyDoctor(doc.id, doc.isVerified)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                          doc.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {doc.isVerified ? 'Verified ✓' : 'Approve License'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent System Activity Logs */}
            <div className="bg-white p-5 rounded border border-slate-200 shadow-xs">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Recent Audit Activity</span>
                <span className="text-[11px] text-sky-700 font-semibold cursor-pointer" onClick={() => setActiveTab('logs')}>
                  Full Log →
                </span>
              </h3>

              <div className="mt-3 space-y-2.5">
                {activityLogs.slice(0, 4).map((log) => (
                  <div key={log.id} className="text-xs p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mb-0.5">
                      <span className="font-semibold text-slate-700">{log.userName} ({log.userRole})</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-800 font-medium">{log.details}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Manage Doctors */}
      {activeTab === 'doctors' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Doctor Credentials & Verification Roster
              </h2>
              <p className="text-xs text-slate-500">
                Review state licenses, toggle featured promotion, or edit practitioner profile parameters.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Practitioner Name & License</th>
                  <th className="py-3 px-4">Specialty & City</th>
                  <th className="py-3 px-4">Experience & Fee</th>
                  <th className="py-3 px-4">Rating</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {doctors.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={doc.avatarUrl}
                          alt={doc.fullName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded object-cover border border-slate-200"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{doc.fullName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            License: {doc.registrationNumber}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{doc.specialtyName}</span>
                      <span className="text-slate-500">{doc.cityName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-slate-800 block">{doc.experienceYears} Years</span>
                      <span className="font-mono text-slate-600 font-semibold">Rs. {doc.consultationFee.toLocaleString()}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="flex items-center gap-1 font-bold text-slate-800">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        {doc.rating.toFixed(2)} ({doc.reviewCount})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleVerifyDoctor(doc.id, doc.isVerified)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                          doc.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        {doc.isVerified ? 'Verified ✓' : 'Approve License'}
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleFeaturedDoctor(doc.id, doc.isFeatured)}
                        className={`px-2.5 py-1 rounded text-xs font-semibold border transition-colors ${
                          doc.isFeatured
                            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                            : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}
                      >
                        {doc.isFeatured ? 'Featured ★' : 'Standard'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('doctor-profile', { doctorId: doc.id })}
                        className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded"
                      >
                        View Public Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Manage Patients */}
      {activeTab === 'patients' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Registered Patient Directory
            </h2>
            <p className="text-xs text-slate-500">
              Overview of registered patient accounts, emergency contact files, and booking frequencies.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Patient Name & Email</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Blood Group & Allergies</th>
                  <th className="py-3 px-4">Emergency Contact</th>
                  <th className="py-3 px-4">Total Bookings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {allPatients.map((p) => {
                  const patientBookings = appointments.filter(a => a.patientId === p.id || a.patientEmail === p.email);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 block">{p.fullName}</span>
                        <span className="text-slate-500">{p.email}</span>
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {p.phone || '+1 (212) 555-7832'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-1.5 py-0.5 bg-rose-50 text-rose-800 border border-rose-200 rounded font-bold mr-2">
                          {p.bloodGroup || 'O+'}
                        </span>
                        <span className="text-slate-500">
                          {(p.allergies || ['None recorded']).join(', ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.emergencyContact || 'Sarah Miller (+1 212-555-7833)'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-sky-700">{patientBookings.length} Visits</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. Master Appointments Control */}
      {activeTab === 'appointments' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Master Appointment Records
            </h2>
            <p className="text-xs text-slate-500">
              Live records of all consultations scheduled across clinics and doctors.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Token & Patient</th>
                  <th className="py-3 px-4">Consultant Doctor</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Fee (Direct)</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {appointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-sky-700 block">{apt.tokenNumber}</span>
                      <span className="font-semibold text-slate-900 block">{apt.patientName}</span>
                      <span className="text-[11px] text-slate-500">{apt.reasonForVisit}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{apt.doctorName}</span>
                      <span className="text-slate-500 text-[11px]">{apt.doctorSpecialty}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{apt.appointmentDate}</span>
                      <span className="font-mono text-slate-600">{apt.appointmentTime}</span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      Rs. {apt.consultationFee.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={apt.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {apt.status !== 'confirmed' && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'confirmed');
                              showNotification(`Appointment ${apt.tokenNumber} confirmed by administrator`);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded"
                          >
                            Confirm
                          </button>
                        )}
                        {apt.status !== 'cancelled' && (
                          <button
                            onClick={() => {
                              updateAppointmentStatus(apt.id, 'cancelled', { cancellationReason: 'Admin override' });
                              showNotification(`Appointment ${apt.tokenNumber} cancelled by administrator`);
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. Specialties & Cities */}
      {activeTab === 'specialties' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specialties Management */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Medical Specialties ({specialties.length})
                </h3>
                <p className="text-[11px] text-slate-500">Clinical departments available on the platform</p>
              </div>
              <button
                onClick={() => setIsAddingSpecialty(true)}
                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Specialty</span>
              </button>
            </div>

            {isAddingSpecialty && (
              <form onSubmit={handleSaveNewSpecialty} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="Specialty Name (e.g. Oncology)"
                  value={specName}
                  onChange={(e) => setSpecName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
                <input
                  type="text"
                  placeholder="Brief description..."
                  value={specDesc}
                  onChange={(e) => setSpecDesc(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingSpecialty(false)}
                    className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 text-white rounded font-semibold"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {specialties.map((s) => (
                <div key={s.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{s.name}</span>
                    <span className="text-slate-500 text-[11px]">{s.description}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteSpecialty(s.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cities Management */}
          <div className="bg-white p-5 rounded border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Service Cities & Regions ({cities.length})
                </h3>
                <p className="text-[11px] text-slate-500">Locations where hospital centers operate</p>
              </div>
              <button
                onClick={() => setIsAddingCity(true)}
                className="px-2.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add City</span>
              </button>
            </div>

            {isAddingCity && (
              <form onSubmit={handleSaveNewCity} className="p-3 bg-slate-50 border border-slate-200 rounded space-y-2 text-xs">
                <input
                  type="text"
                  required
                  placeholder="City Name (e.g. Seattle)"
                  value={cityName}
                  onChange={(e) => setCityName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
                <input
                  type="text"
                  placeholder="State Code (e.g. WA)"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-800"
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingCity(false)}
                    className="px-2 py-1 text-slate-600 hover:bg-slate-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-sky-600 text-white rounded font-semibold"
                  >
                    Save City
                  </button>
                </div>
              </form>
            )}

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {cities.map((c) => (
                <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{c.name}, {c.state}</span>
                    <span className="text-slate-500 text-[11px]">{c.country}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteCity(c.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. Patient Reviews Moderation */}
      {activeTab === 'reviews' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Patient Feedback & Review Moderation
            </h2>
            <p className="text-xs text-slate-500">
              Audit patient ratings, approve verified testimonials, or remove inappropriate submissions.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="p-4 flex flex-col sm:flex-row items-start justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{rev.patientName}</span>
                    <div className="flex items-center gap-0.5 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-500" />
                      ))}
                    </div>
                    <span className="text-[11px] text-slate-400">· {rev.visitReason}</span>
                  </div>

                  <p className="text-slate-700 italic">"{rev.comment}"</p>
                  <span className="text-[10px] text-slate-400 block">
                    Doctor ID: {rev.doctorId} · {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggleReview(rev.id, rev.isApproved)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold border ${
                      rev.isApproved
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-300'
                    }`}
                  >
                    {rev.isApproved ? 'Approved Public' : 'Pending Approval'}
                  </button>
                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Activity Logs */}
      {activeTab === 'logs' && (
        <div className="bg-white border border-slate-200 rounded shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              System Audit Trail & Security Event Logs
            </h2>
            <p className="text-xs text-slate-500">
              Chronological log of user actions, appointment reservations, verifications, and system modifications.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px]">
                  <th className="py-2.5 px-4">Timestamp</th>
                  <th className="py-2.5 px-4">User</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Action Code</th>
                  <th className="py-2.5 px-4">Activity Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono text-[11px]">
                {activityLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-4 font-sans font-semibold text-slate-900">
                      {log.userName}
                    </td>
                    <td className="py-2.5 px-4 uppercase font-sans">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.userRole === 'admin' ? 'bg-slate-900 text-white' :
                        log.userRole === 'doctor' ? 'bg-teal-100 text-teal-900' : 'bg-sky-100 text-sky-900'
                      }`}>
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-bold text-sky-800">
                      {log.action}
                    </td>
                    <td className="py-2.5 px-4 font-sans text-slate-800">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. Website Settings */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs max-w-3xl">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 pb-2 border-b border-slate-100 flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-700" />
            <span>Platform Configuration & Global Policies</span>
          </h2>
          <p className="text-xs text-slate-500 mb-6">
            Configure clinic contact hotlines, appointment scheduling rules, and maintenance modes.
          </p>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Platform Brand Name</label>
                <input
                  type="text"
                  required
                  value={settingsForm.siteName}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteName: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Support Email</label>
                <input
                  type="email"
                  required
                  value={settingsForm.siteEmail}
                  onChange={(e) => setSettingsForm({ ...settingsForm, siteEmail: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Customer Service Hotline</label>
                <input
                  type="text"
                  required
                  value={settingsForm.sitePhone}
                  onChange={(e) => setSettingsForm({ ...settingsForm, sitePhone: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">24/7 Emergency Dispatch Number</label>
                <input
                  type="text"
                  required
                  value={settingsForm.emergencyHotline}
                  onChange={(e) => setSettingsForm({ ...settingsForm, emergencyHotline: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Central Headquarters Address</label>
                <input
                  type="text"
                  required
                  value={settingsForm.address}
                  onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Minimum Lead Notice Before Appointment (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={settingsForm.appointmentLeadHours}
                  onChange={(e) => setSettingsForm({ ...settingsForm, appointmentLeadHours: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default Slot Interval (Minutes)</label>
                <select
                  value={settingsForm.slotIntervalMinutes}
                  onChange={(e) => setSettingsForm({ ...settingsForm, slotIntervalMinutes: Number(e.target.value) })}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-800 focus:outline-none focus:border-sky-600"
                >
                  <option value="15">15 minutes</option>
                  <option value="20">20 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Platform Settings</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
