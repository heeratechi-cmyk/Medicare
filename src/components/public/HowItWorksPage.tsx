import React from 'react';
import { ShieldCheck, Calendar, FileText, CheckCircle2, Clock, HelpCircle, PhoneCall, AlertCircle } from 'lucide-react';

interface HowItWorksPageProps {
  onNavigate: (view: string, data?: any) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => onNavigate('home')} className="hover:text-slate-900">
          Home
        </button>
        <span>/</span>
        <span className="text-slate-800 font-semibold">How It Works</span>
      </nav>

      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded border border-slate-200 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-sky-50 text-sky-800 border border-sky-200 rounded text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
            <span>Transparent Healthcare Booking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">How MediCare Appointment Booking Operates</h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            MediCare is engineered to simplify patient access to board-certified medical specialists without upfront gatekeeping or online booking surcharges.
          </p>
        </div>
      </div>

      {/* 3 Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-700 font-bold rounded flex items-center justify-center text-sm">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-900">Discover & Compare Doctors</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Filter doctors by medical specialty, affiliated clinic location, consultation fees, and real patient review ratings.
          </p>
        </div>

        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-700 font-bold rounded flex items-center justify-center text-sm">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900">Choose Open Slot & Confirm</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Select an open date and time slot directly from the physician's weekly timetable. Enter your contact details and primary reason for visit.
          </p>
        </div>

        <div className="bg-white p-6 rounded border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-sky-100 text-sky-700 font-bold rounded flex items-center justify-center text-sm">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-900">Receive Pass & Consult</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Get an instant official visit pass with unique Token #. Print your confirmation and pay your regular consultation fee at the clinic desk.
          </p>
        </div>
      </div>

      {/* Zero Payment Policy Callout */}
      <div className="bg-sky-50 border border-sky-200 rounded p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-sky-600 text-white rounded flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Zero Online Payment Policy</h3>
            <p className="text-xs text-slate-700 mt-1 leading-relaxed">
              MediCare does not process credit cards, deposits, or digital payments. All consultation fees listed are strictly informational and correspond to the standard clinic rates payable directly at reception upon check-in.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white p-6 sm:p-8 rounded border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-sky-600" />
          <span>Frequently Asked Questions</span>
        </h2>

        <div className="space-y-4 text-xs">
          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">How are doctor credentials verified?</h4>
            <p className="text-slate-600 leading-relaxed">
              Every medical practitioner must submit their state medical board registration number and hospital credentials. Our clinical audit team verifies active licensing status prior to enabling public profile visibility.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">Can I cancel or reschedule my appointment?</h4>
            <p className="text-slate-600 leading-relaxed">
              Yes, patients can cancel or reschedule appointments directly from their Patient Dashboard up to 2 hours before the scheduled appointment time.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded border border-slate-200">
            <h4 className="font-bold text-slate-900 mb-1">What should I bring to my clinic appointment?</h4>
            <p className="text-slate-600 leading-relaxed">
              Please present your printed MediCare visit token slip (or the digital confirmation on your phone), a government photo ID, any previous diagnostic reports or imaging, and your health insurance card if applicable.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
