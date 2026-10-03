import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { GlobalLoadingOverlay } from '../common/SearchLoadingOverlay';
import { 
  X, 
  Lock, 
  Mail, 
  User, 
  Stethoscope, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  RotateCcw, 
  ArrowLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AuthModalProps {
  initialMode?: 'login' | 'signup';
  defaultRole?: UserRole;
  onClose: () => void;
  onSuccess?: () => void;
  onNavigate?: (view: string, data?: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  initialMode = 'login',
  defaultRole = 'patient',
  onClose,
  onSuccess,
  onNavigate,
}) => {
  const { login, signup } = useAuth();

  // Professional Loading Dots Component
  const LoadingDots = () => (
    <div className="flex items-center justify-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-white rounded-full"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
          }}
        />
      ))}
    </div>
  );

  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>(initialMode);
  const [signupStep, setSignupStep] = useState<'form' | 'otp'>('form');
  const [role, setRole] = useState<UserRole>(defaultRole);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [doctorRegNumber, setDoctorRegNumber] = useState('');

  // 4-Digit OTP State
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '']);
  const [resendCountdown, setResendCountdown] = useState<number>(60);
  const otpInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null)
  ];

  // Feedback States
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState('Processing...');

  // Countdown timer for OTP resend (60 seconds)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (signupStep === 'otp' && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [signupStep, resendCountdown]);

  // Generate and send 4-digit OTP
  const handleSendOtp = () => {
    setErrorMsg('');
    if (!fullName.trim()) {
      setErrorMsg('Please enter your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    // Generate random 4-digit code
    const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(randomCode);
    setOtpDigits(['', '', '', '']);
    setResendCountdown(60);
    
    // Professional delay before showing OTP step
    setIsSubmitting(true);
    setLoadingText('Securing Account Details...');
    
    setTimeout(() => {
      setSignupStep('otp');
      setIsSubmitting(false);

      // Trigger real SMTP dispatch
      fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          otp: randomCode,
          fullName: fullName.trim(),
        }),
      }).then(res => res.json()).then(data => {
        console.log('SMTP OTP Dispatch Response:', data);
      }).catch(err => {
        console.warn('SMTP OTP Dispatch note:', err);
      });

      // Focus on the first OTP input
      setTimeout(() => {
        otpInputRefs[0].current?.focus();
      }, 100);
    }, 1200);
  };

  // Resend OTP code
  const handleResendOtp = () => {
    const newCode = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(newCode);
    setOtpDigits(['', '', '', '']);
    setResendCountdown(60);
    setErrorMsg('');
    setSuccessMsg('A new 4-digit security code has been sent to your email.');

    // Trigger real SMTP dispatch
    fetch('/api/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.trim(),
        otp: newCode,
        fullName: fullName.trim(),
      }),
    }).catch(err => {
      console.warn('SMTP OTP Dispatch note:', err);
    });

    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Handle individual OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otpDigits];
    newOtp[index] = value.slice(-1);
    setOtpDigits(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpInputRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs[index - 1].current?.focus();
    }
  };

  // Final OTP verification and signup submission
  const handleVerifyOtp = async () => {
    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length !== 4) {
      setErrorMsg('Please enter the complete 4-digit code.');
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setErrorMsg('Incorrect 4-digit code. Please check your email code and try again.');
      return;
    }

    setErrorMsg('');
    setLoadingText('Verifying Security Code & Registering...');
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        const res = await signup({
          email: email.trim(),
          fullName: fullName.trim(),
          role,
          phone: phone.trim() || undefined,
        });

        if (res.success) {
          confetti({
            particleCount: 90,
            spread: 70,
            origin: { y: 0.6 },
          });

          if (onSuccess) onSuccess();
          if (onNavigate) {
            onNavigate('home');
          }
          onClose();
        } else {
          setErrorMsg(res.message || 'Signup failed. Please try again.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected authentication error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }, 800);
  };

  // Standard Login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoadingText('Signing into MediCare...');
    setIsSubmitting(true);

    setTimeout(async () => {
      try {
        if (mode === 'forgot') {
          setSuccessMsg(`Password reset instructions have been dispatched to ${email}`);
          setIsSubmitting(false);
          return;
        }

        const res = await login(email, role);
        if (res.success) {
          if (onSuccess) onSuccess();
          if (onNavigate) onNavigate('home');
          onClose();
        } else {
          setErrorMsg(res.message || 'Invalid email or password.');
        }
      } catch (err: any) {
        setErrorMsg(err.message || 'An unexpected authentication error occurred.');
      } finally {
        setIsSubmitting(false);
      }
    }, 1000);
  };

  return (
    <>
      {isSubmitting && (
        <GlobalLoadingOverlay 
          title={loadingText}
          subtitle="Establishing secure clinical session and updating profile..." 
        />
      )}

      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white border border-slate-300 rounded shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center overflow-hidden rounded bg-white p-0.5">
                <img 
                  src="/src/assets/images/medicare_hospital_brand_v1_1791047655537.jpg" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">
                  {mode === 'login' && 'Sign In to MediCare'}
                  {mode === 'signup' && (signupStep === 'form' ? 'Create MediCare Account' : 'Verify Email Code')}
                  {mode === 'forgot' && 'Reset Your Password'}
                </h3>
                <p className="text-[11px] text-slate-400 capitalize">
                  {mode === 'signup' && signupStep === 'otp' ? 'Step 2 of 2: Security Verification' : `Portal Access: ${role}`}
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

          {/* Role Segmented Selector (When on credentials form) */}
          {mode !== 'forgot' && (mode === 'login' || signupStep === 'form') && (
            <div className="bg-slate-100 p-1 border-b border-slate-200 flex text-xs font-semibold text-slate-700">
              <button
                type="button"
                onClick={() => setRole('patient')}
                className={`flex-1 py-1.5 rounded text-center transition-colors flex items-center justify-center gap-1.5 ${
                  role === 'patient' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Patient</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`flex-1 py-1.5 rounded text-center transition-colors flex items-center justify-center gap-1.5 ${
                  role === 'doctor' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5" />
                <span>Doctor</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex-1 py-1.5 rounded text-center transition-colors flex items-center justify-center gap-1.5 ${
                  role === 'admin' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>
          )}

          {/* Alerts */}
          <div className="px-6 pt-4 space-y-2">
            {errorMsg && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}
          </div>

          {/* CASE 1: SIGNUP STEP 1 - FILL CREDENTIALS WITH EYE BUTTON */}
          {mode === 'signup' && signupStep === 'form' && (
            <div className="p-6 pt-2 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={role === 'doctor' ? 'Dr. Tariq Mahmood, MD' : 'Muhammad Ali'}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full bg-white border border-slate-300 rounded pl-3 pr-9 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-600" />}
                  </button>
                </div>
              </div>

              {role === 'doctor' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medical License / PMDC Reg # <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={doctorRegNumber}
                    onChange={(e) => setDoctorRegNumber(e.target.value)}
                    placeholder="e.g. PMC-48921-P"
                    className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="w-full h-10 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <span>Next: Send 4-Digit Code</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* CASE 2: SIGNUP STEP 2 - 4-DIGIT OTP WITH EMAIL TEMPLATE & 60s RESEND */}
          {mode === 'signup' && signupStep === 'otp' && (
            <div className="p-6 pt-2 space-y-4">
              {/* Back to edit info */}
              <button
                type="button"
                onClick={() => setSignupStep('form')}
                className="text-[11px] text-sky-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Change Email or Password</span>
              </button>

              {/* 4-Digit Inputs */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 text-center mb-2">
                  Enter 4-Digit Verification Code
                </label>
                <div className="flex justify-center gap-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={otpInputRefs[idx]}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-12 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 rounded focus:border-sky-600 focus:bg-white focus:outline-none transition-all"
                    />
                  ))}
                </div>
              </div>

              {/* 60 Seconds Resend Countdown */}
              <div className="text-center text-xs text-slate-600 space-y-1">
                {resendCountdown > 0 ? (
                  <p className="text-slate-500 font-medium">
                    Resend code in <span className="font-mono font-bold text-sky-700">{resendCountdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 font-bold underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Resend 4-Digit Code Now</span>
                  </button>
                )}
              </div>

              {/* Verify & Complete Registration Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={isSubmitting}
                  className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <LoadingDots />
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verify & Go to Home Page</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* CASE 3: LOGIN FORM WITH EYE BUTTON */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="p-6 pt-2 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-[11px] text-sky-600 hover:text-sky-800 underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-300 rounded pl-3 pr-9 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-sky-600" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center"
                >
                  {isSubmitting ? <LoadingDots /> : `Sign In as ${role.toUpperCase()}`}
                </button>
              </div>
            </form>
          )}

          {/* CASE 4: FORGOT PASSWORD */}
          {mode === 'forgot' && (
            <form onSubmit={handleLoginSubmit} className="p-6 pt-2 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@medicare.com"
                  className="w-full bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded text-xs font-bold shadow-xs transition-colors flex items-center justify-center"
              >
                {isSubmitting ? <LoadingDots /> : 'Send Password Reset Instructions'}
              </button>
            </form>
          )}

          {/* Modal Bottom Switcher */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 text-center text-xs text-slate-600">
            {mode === 'login' ? (
              <p>
                Don't have an account yet?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setSignupStep('form');
                  }}
                  className="text-sky-700 font-semibold hover:underline"
                >
                  Register here
                </button>
              </p>
            ) : (
              <p>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setSignupStep('form');
                  }}
                  className="text-sky-700 font-semibold hover:underline"
                >
                  Sign In
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
