import React from 'react';
import { Specialty, Doctor } from '../../types';
import { Stethoscope, ChevronRight, Users, ShieldCheck, HeartPulse } from 'lucide-react';

interface SpecialtiesPageProps {
  specialties: Specialty[];
  doctors: Doctor[];
  onNavigate: (view: string, data?: any) => void;
}

export const SpecialtiesPage: React.FC<SpecialtiesPageProps> = ({
  specialties,
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
        <span className="text-slate-800 font-semibold">Specialties & Departments</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 rounded border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded text-xs font-semibold mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
            <span>Comprehensive Clinical Directory</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Medical Specialties & Clinical Departments</h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            MediCare brings together certified physicians across all branches of modern medicine. Select a clinical department below to view practicing consultants and book direct consultation slots.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {specialties.map((spec) => {
          const matchingDocs = doctors.filter(d => d.specialtyId === spec.id);
          return (
            <div
              key={spec.id}
              className="bg-white border border-slate-200 rounded shadow-xs p-5 hover:border-sky-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded flex items-center justify-center mb-3">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1">{spec.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {spec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  {matchingDocs.length > 0 ? `${matchingDocs.length} Specialists Available` : 'Consultants on Roster'}
                </span>
                <button
                  onClick={() => onNavigate('search-doctors', { specialtyId: spec.id })}
                  className="font-bold text-sky-700 hover:text-sky-800 inline-flex items-center gap-1"
                >
                  <span>Find Doctors</span>
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
