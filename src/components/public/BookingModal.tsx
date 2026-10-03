import React, { useState, useEffect } from 'react';
import { Doctor, ConsultationType } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getAvailableSlotsForDate, createAppointment } from '../../lib/storage';
import { GlobalLoadingOverlay } from '../common/SearchLoadingOverlay';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  CheckCircle, 
  MapPin, 
  Printer, 
  Stethoscope, 
  FileText,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  doctor: Doctor;
  initialDate?: string;
  initialSlot?: string;
  onClose: () => void;
  onSuccess: (appointment: any) => void;
  onOpenPrintSlip: (appointment: any) => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  doctor,
  initialDate,
  initialSlot,
  onClose,
  onSuccess,
  onOpenPrintSlip,
}) => {
  const { user } = useAuth();
  
  // Format today as YYYY-MM-DD
  const todayStr = new Date().toISOString().split('T')[0];

  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Date & Time, 2: Patient details, 3: Success
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot || '');
  const [consultationType, setConsultationType] = useState<ConsultationType>('in-person');

  // Patient Info Form State
  const [patientType, setPatientType] = useState<'self' | 'someone_else'>('self');
  const [patientName, setPatientName] = useState(user?.fullName || '');
  const [patientEmail, setPatientEmail] = useState(user?.email || '');
  const [patientPhone, setPatientPhone] = useState(user?.phone || '+1 (212) 555-0199');
  const [patientGender, setPatientGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'male');
  const [patientAge, setPatientAge] = useState<number>(32);
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [isFirstVisit, setIsFirstVisit] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdAppointment, setCreatedAppointment] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Update slots when date or doctor changes
  useEffect(() => {
    if (selectedDate) {
      const slots = getAvailableSlotsForDate(doctor, selectedDate);
      setAvailableSlots(slots);
      if (slots.length > 0 && !slots.includes(selectedSlot)) {
        setSelectedSlot(slots[0]);
      } else if (slots.length === 0) {
        setSelectedSlot('');
      }
    }
  }, [doctor, selectedDate]);

  const handleNextToPatientDetails = () => {
    if (!selectedDate) {
      setErrorMessage('Please choose an appointment date.');
      return;
    }
    if (!selectedSlot) {
      setErrorMessage('Please select an available time slot for this date.');
      return;
    }
    setErrorMessage('');
    setStep(2);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim()) {
      setErrorMessage('Please enter the patient’s full name.');
      return;
    }
    if (!patientPhone.trim()) {
      setErrorMessage('Please enter a valid contact phone number.');
      return;
    }
    if (!reasonForVisit.trim()) {
      setErrorMessage('Please state the primary reason for consultation.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    setTimeout(() => {
      try {
        const appointment = createAppointment({
          patientId: user?.id || 'guest-' + Date.now(),
          patientName: patientName.trim(),
          patientEmail: patientEmail.trim(),
          patientPhone: patientPhone.trim(),
          patientGender,
          patientAge: Number(patientAge) || 30,
          doctorId: doctor.id,
          doctorName: doctor.fullName,
          doctorSpecialty: doctor.specialtyName,
          doctorAvatarUrl: doctor.avatarUrl,
          clinicName: doctor.clinicName,
          clinicAddress: doctor.clinicAddress,
          appointmentDate: selectedDate,
          appointmentTime: selectedSlot,
          consultationType,
          consultationFee: doctor.consultationFee,
          reasonForVisit: reasonForVisit.trim(),
          symptoms: symptoms.trim() || undefined,
          isFirstVisit,
        });

        setCreatedAppointment(appointment);
        setStep(3);
        onSuccess(appointment);

        // Send confirmation email via SMTP
        if (patientEmail.trim()) {
          fetch('/api/send-appointment-confirmation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: patientEmail.trim(),
              patientName: patientName.trim(),
              doctorName: doctor.fullName,
              tokenNumber: appointment.tokenNumber,
              appointmentDate: selectedDate,
              appointmentTime: selectedSlot,
              clinicName: doctor.clinicName,
              clinicAddress: doctor.clinicAddress,
            }),
          }).catch(err => console.log('Appointment SMTP notice:', err));
        }

        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to book appointment. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, 850);
  };

  return (
    <>
      {isSubmitting && (
        <GlobalLoadingOverlay 
          title="Confirming & Reserving Appointment..." 
          subtitle="Allocating official hospital visit token & registering with clinic desk..." 
        />
      )}

      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
        <div className="bg-white border border-slate-300 rounded shadow-xl max-w-2xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-sky-600 rounded flex items-center justify-center font-bold text-white">
              +
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Book Doctor Appointment</h3>
              <p className="text-xs text-slate-300">
                {doctor.title} · {doctor.specialtyName}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Multi-step progress indicator */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 py-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step >= 1 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              1
            </span>
            <span className={step === 1 ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Date & Slot
            </span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step >= 2 ? 'bg-sky-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              2
            </span>
            <span className={step === 2 ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Patient Info
            </span>
          </div>
          <span className="text-slate-300">→</span>
          <div className="flex items-center gap-2">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
              step === 3 ? 'bg-emerald-600 text-white' : 'bg-slate-300 text-slate-600'
            }`}>
              3
            </span>
            <span className={step === 3 ? 'font-semibold text-slate-900' : 'text-slate-500'}>
              Confirmation
            </span>
          </div>
        </div>

        {/* Doctor Summary Bar */}
        <div className="bg-sky-50/70 border-b border-sky-100 px-6 py-3 flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2.5">
            <img
              src={doctor.avatarUrl}
              alt={doctor.fullName}
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded object-cover border border-sky-200"
            />
            <div>
              <span className="font-bold text-slate-900 block">{doctor.fullName}</span>
              <span className="text-slate-600 text-[11px] block">{doctor.clinicName}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-sky-800 block">Consultation Fee</span>
            <span className="font-bold text-slate-900 text-sm block">
              Rs. {doctor.consultationFee.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 block">Pay at Clinic Desk</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Select Date & Time Slot */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            {/* Consultation Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setConsultationType('in-person')}
                  className={`p-3 rounded border text-left transition-all ${
                    consultationType === 'in-person'
                      ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 mb-0.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>In-Person Clinic Visit</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Visit doctor at {doctor.clinicName}</p>
                </button>

                <button
                  type="button"
                  onClick={() => setConsultationType('video')}
                  className={`p-3 rounded border text-left transition-all ${
                    consultationType === 'video'
                      ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 mb-0.5 flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                    <span>Video Tele-Consultation</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Consult securely via high-speed video call</p>
                </button>
              </div>
            </div>

            {/* Date Picker */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Select Appointment Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>
            </div>

            {/* Time Slot Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Available Time Slots ({availableSlots.length} available)
                </label>
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  30 mins duration
                </span>
              </div>

              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded bg-slate-50/50">
                  {availableSlots.map((slot) => {
                    const isSelected = selectedSlot === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2 px-2 text-xs font-medium rounded border transition-all ${
                          isSelected
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'bg-white text-slate-800 border-slate-300 hover:border-sky-400 hover:bg-sky-50/50'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded text-center text-xs text-slate-500">
                  <Clock className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">No slots available on this date</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Please select another date from doctor’s schedule.</p>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedSlot || availableSlots.length === 0}
                onClick={handleNextToPatientDetails}
                className="px-5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed rounded shadow-xs transition-colors"
              >
                Continue to Patient Info →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Patient Info Form */}
        {step === 2 && (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-4">
            {/* Booking For Toggle */}
            <div className="flex items-center gap-4 text-xs font-medium pb-2 border-b border-slate-100">
              <span className="text-slate-500">Booking this appointment for:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="patient_type"
                  checked={patientType === 'self'}
                  onChange={() => {
                    setPatientType('self');
                    if (user) {
                      setPatientName(user.fullName);
                      setPatientEmail(user.email);
                      setPatientPhone(user.phone || '+1 (212) 555-0199');
                    }
                  }}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span>Myself</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="patient_type"
                  checked={patientType === 'someone_else'}
                  onChange={() => {
                    setPatientType('someone_else');
                    setPatientName('');
                  }}
                  className="text-sky-600 focus:ring-sky-500"
                />
                <span>Family Member / Child</span>
              </label>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="e.g. Johnathan Miller"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={patientEmail}
                  onChange={(e) => setPatientEmail(e.target.value)}
                  placeholder="patient@example.com"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={patientAge}
                    onChange={(e) => setPatientAge(Number(e.target.value))}
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={patientGender}
                    onChange={(e) => setPatientGender(e.target.value as any)}
                    className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Visit / Primary Concern <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="e.g. Annual cardiovascular checkup, chest tightness, chronic migraines"
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Current Symptoms or Medical Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Briefly describe symptoms, duration, current medications, or allergies..."
                className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
              ></textarea>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="first_visit"
                checked={isFirstVisit}
                onChange={(e) => setIsFirstVisit(e.target.checked)}
                className="rounded text-sky-600 focus:ring-sky-500"
              />
              <label htmlFor="first_visit" className="text-xs text-slate-700 cursor-pointer">
                This is my first time consulting this specialist doctor
              </label>
            </div>

            {/* Zero-payment Notice */}
            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-[11px] text-slate-600">
              <span className="font-semibold text-slate-800">Payment Notice:</span> No online card or advance payment is required. The consultation fee of <strong>Rs. {doctor.consultationFee.toLocaleString()}</strong> is payable upon check-in at the clinic reception desk.
            </div>

            {/* Form actions */}
            <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded border border-slate-300 transition-colors"
              >
                ← Back to Slot
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded shadow-xs transition-colors flex items-center gap-1.5"
              >
                {isSubmitting ? 'Booking Slot...' : 'Confirm & Reserve Appointment'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Success Confirmation */}
        {step === 3 && createdAppointment && (
          <div className="p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">Appointment Successfully Reserved!</h3>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Your consultation slot with <strong>{createdAppointment.doctorName}</strong> has been logged in the MediCare system.
              </p>
            </div>

            {/* Summary card */}
            <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs text-left max-w-md mx-auto space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-mono">Token Number:</span>
                <span className="font-mono font-bold text-sky-700 text-sm">{createdAppointment.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Time:</span>
                <span className="font-semibold text-slate-800">
                  {createdAppointment.appointmentDate} at {createdAppointment.appointmentTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinic Location:</span>
                <span className="text-slate-800 text-right">{createdAppointment.clinicName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Patient:</span>
                <span className="text-slate-800">{createdAppointment.patientName}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200">
                <span className="text-slate-500">Fee (Pay at clinic):</span>
                <span className="font-bold text-slate-900">Rs. {createdAppointment.consultationFee.toLocaleString()}</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => {
                  onOpenPrintSlip(createdAppointment);
                  onClose();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Visit Slip</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold border border-slate-300 transition-colors"
              >
                Done / Return to Portal
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </>
  );
};
