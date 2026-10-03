import React from 'react';
import { Clinic, Doctor } from '../../types';
import { Building2, MapPin, Phone, Clock, Mail, ChevronRight, Stethoscope } from 'lucide-react';

interface ClinicsPageProps {
  clinics: Clinic[];
  doctors: Doctor[];
  onNavigate: (view: string, data?: any) => void;
}

export const ClinicsPage: React.FC<ClinicsPageProps> = ({
  clinics,
  doctors,
  onNavigate,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">Clinics & Hospital Centers</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Hospital & Polyclinic Network</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our medical facilities are equipped with modern diagnostic imaging, ambulatory surgical suites, and multi-specialty consultation centers across major metropolitan regions.
          </p>
        </div>
      </div>

      {/* Clinics List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {clinics.map((clinic) => {
          const clinicDocs = doctors.filter(d => d.clinicId === clinic.id || d.clinicName.includes(clinic.name));
          return (
            <div
              key={clinic.id}
              className="bg-white border border-slate-200 rounded shadow-xs p-6 hover:border-slate-300 transition-colors flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded flex items-center justify-center shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 leading-tight">
                      {clinic.name}
                    </h3>
                    <p className="text-xs text-sky-700 font-medium mt-0.5">{clinic.cityName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <span>{clinic.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{clinic.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span>{clinic.openingHours}</span>
                  </div>
                  {clinic.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                      <span>{clinic.email}</span>
                    </div>
                  )}
                </div>

                {/* Practicing doctors */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 block mb-1.5 flex items-center gap-1">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                    <span>Attending Specialists ({clinicDocs.length}):</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {clinicDocs.map(doc => (
                      <button
                        key={doc.id}
                        onClick={() => onNavigate('doctor-profile', { doctorId: doc.id })}
                        className="px-2 py-0.5 bg-white border border-slate-200 rounded text-[11px] text-slate-800 hover:border-sky-500 font-medium"
                      >
                        {doc.fullName} ({doc.specialtyName})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => onNavigate('search-doctors', { cityId: clinic.cityId })}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1"
                >
                  <span>View Doctors at this Location</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
