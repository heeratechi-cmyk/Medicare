import React from 'react';
import { Appointment } from '../../types';
import { Printer, X, CheckCircle, Calendar, Clock, MapPin, User, Stethoscope, AlertCircle } from 'lucide-react';

interface PrintableAppointmentSlipProps {
  appointment: Appointment;
  onClose: () => void;
}

export const PrintableAppointmentSlip: React.FC<PrintableAppointmentSlipProps> = ({ appointment, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6">
      <div className="bg-white border border-slate-300 rounded shadow-2xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Action Bar (Hidden on print) */}
        <div className="no-print bg-slate-800 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-semibold">Appointment Confirmation & Visit Slip</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded text-xs font-semibold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Area */}
        <div id="printable-appointment-slip" className="p-8 text-slate-900 bg-white">
          {/* Slip Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-sky-700 text-white rounded flex items-center justify-center font-bold text-base">
                  +
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  MediCare Healthcare System
                </span>
              </div>
              <p className="text-xs text-slate-500">Official Clinical Appointment Token & Patient Receipt</p>
              <p className="text-[11px] text-slate-500">MediCare Healthcare Pakistan · Phone: +92 (042) 111-CARE (2273)</p>
            </div>

            <div className="text-right">
              <span className="text-xs text-slate-500 block uppercase font-mono">Token Number</span>
              <span className="text-lg font-mono font-bold text-sky-700 block tracking-wider">
                {appointment.tokenNumber}
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold uppercase bg-slate-100 border border-slate-300 rounded text-slate-800">
                Status: {appointment.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="mb-6 py-2 px-4 bg-slate-50 border border-slate-200 rounded flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-[10px] uppercase font-sans font-semibold text-slate-500">Verification Ref:</span>
              <span>{appointment.id.toUpperCase()}</span>
            </div>
            <div className="text-slate-500 text-[10px] tracking-widest font-mono">
              ||| | |||| | || |||| | ||| |||| |
            </div>
          </div>

          {/* 2-Column Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            {/* Patient Info */}
            <div className="bg-slate-50/60 p-4 rounded border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <User className="w-3.5 h-3.5 text-sky-600" />
                <span>Patient Information</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-semibold text-slate-900 ml-1.5">{appointment.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Contact Phone:</span>
                  <span className="font-mono text-slate-800 ml-1.5">{appointment.patientPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">Email:</span>
                  <span className="text-slate-800 ml-1.5">{appointment.patientEmail}</span>
                </div>
                {appointment.patientAge && (
                  <div>
                    <span className="text-slate-500">Age / Gender:</span>
                    <span className="text-slate-800 ml-1.5">{appointment.patientAge} yrs / {appointment.patientGender || 'N/A'}</span>
                  </div>
                )}
                <div>
                  <span className="text-slate-500">Patient Type:</span>
                  <span className="text-slate-800 ml-1.5">{appointment.isFirstVisit ? 'New Patient' : 'Follow-up Consultation'}</span>
                </div>
              </div>
            </div>

            {/* Doctor & Clinic Info */}
            <div className="bg-slate-50/60 p-4 rounded border border-slate-200">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                <span>Doctor & Clinic Details</span>
              </h4>
              <div className="space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-500">Consultant:</span>
                  <span className="font-semibold text-slate-900 ml-1.5">{appointment.doctorName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Specialty:</span>
                  <span className="text-slate-800 ml-1.5">{appointment.doctorSpecialty}</span>
                </div>
                <div>
                  <span className="text-slate-500">Hospital / Clinic:</span>
                  <span className="text-slate-800 ml-1.5">{appointment.clinicName}</span>
                </div>
                <div>
                  <span className="text-slate-500">Location:</span>
                  <span className="text-slate-800 ml-1.5">{appointment.clinicAddress}</span>
                </div>
                <div>
                  <span className="text-slate-500">Consultation Type:</span>
                  <span className="text-slate-800 ml-1.5 capitalize">{appointment.consultationType} Consultation</span>
                </div>
              </div>
            </div>
          </div>

          {/* Appointment Schedule & Fee Box */}
          <div className="bg-sky-50/70 border border-sky-200 rounded p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] text-sky-700 uppercase font-semibold block">Date</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {new Date(appointment.appointmentDate + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-sky-700 uppercase font-semibold block">Allocated Time</span>
                <span className="text-sm font-bold text-sky-900 block mt-0.5">
                  {appointment.appointmentTime}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-sky-700 uppercase font-semibold block">Consultation Fee</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  Rs. {appointment.consultationFee.toLocaleString()} (Pay at Clinic)
                </span>
              </div>
            </div>
          </div>

          {/* Reason & Clinical Notes */}
          <div className="mb-6 space-y-3">
            <div className="text-xs">
              <span className="font-semibold text-slate-800">Reason for Consultation:</span>
              <p className="mt-1 text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">
                {appointment.reasonForVisit || 'General Medical Consultation'}
                {appointment.symptoms && (
                  <span className="block mt-1 text-slate-500 italic">Symptoms: {appointment.symptoms}</span>
                )}
              </p>
            </div>

            {appointment.doctorNotes && (
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Doctor's Clinical Notes:</span>
                <p className="mt-1 text-slate-700 bg-amber-50/60 p-2.5 rounded border border-amber-200 whitespace-pre-line">
                  {appointment.doctorNotes}
                </p>
              </div>
            )}

            {appointment.prescriptionSummary && (
              <div className="text-xs">
                <span className="font-semibold text-slate-800">Prescription / Recommendations:</span>
                <p className="mt-1 text-slate-700 bg-emerald-50/60 p-2.5 rounded border border-emerald-200 whitespace-pre-line font-mono text-[11px]">
                  {appointment.prescriptionSummary}
                </p>
              </div>
            )}
          </div>

          {/* Important Patient Instructions */}
          <div className="border-t border-slate-200 pt-4 text-[11px] text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Important Instructions for Patients:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 pl-1">
              <li>Please arrive at the clinic reception 10-15 minutes prior to your allocated slot.</li>
              <li>Present this printed token slip or your digital confirmation on your mobile device at reception.</li>
              <li>Bring a valid photo ID, insurance card (if applicable), and previous diagnostic reports.</li>
              <li>Consultation fee is payable directly at the hospital/clinic reception desk upon arrival.</li>
            </ul>
          </div>
        </div>

        {/* Modal Bottom Footer (no-print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-6 py-3 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 bg-slate-100 rounded border border-slate-300 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Appointment Token</span>
          </button>
        </div>
      </div>
    </div>
  );
};
