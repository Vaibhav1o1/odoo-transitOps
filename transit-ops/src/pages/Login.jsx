import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../components/CommonUI';
import { Modal } from '../components/Modal';

export default function Login() {
  const { login, failedLoginModalOpen, setFailedLoginModalOpen, failedAttemptDetails } = useAuth();
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    }
  });

  const onSubmit = async (data) => {
    setApiError(null);
    setLoading(true);
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans transition-colors">
      
      {/* LEFT SIDE: PRESET ILLUSTRAION & LOGISTICS GRADIENTS */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-slate-900 overflow-hidden select-none">
        {/* Abstract background graphics */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 via-slate-900 to-slate-950 z-0" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        
        {/* Core Graphics Container */}
        <div className="relative z-10 w-full h-full flex flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center space-x-2.5">
            <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center font-black text-lg">
              TO
            </div>
            <span className="font-bold text-xl tracking-tight text-white">
              TransitOps
            </span>
          </div>

          {/* SVG Logistics Vector */}
          <div className="flex-1 flex flex-col items-center justify-center space-y-8">
            <svg className="w-80 h-auto max-w-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Road grid lines */}
              <path d="M50 250 H350" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
              <path d="M50 200 H350" stroke="#1E293B" strokeWidth="2" strokeDasharray="6 6" />
              <path d="M100 250 L200 120" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
              <path d="M300 250 L200 120" stroke="#1E293B" strokeWidth="2" strokeLinecap="round" />
              <path d="M200 120 V50" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" />
              
              {/* Cargo Truck Illustration */}
              <g id="truck" transform="translate(100, 160)">
                <rect x="0" y="30" width="140" height="50" rx="6" fill="#2563EB" />
                <rect x="140" y="45" width="40" height="35" rx="6" fill="#1E293B" />
                <rect x="150" y="50" width="20" height="15" fill="#38BDF8" />
                {/* Wheels */}
                <circle cx="30" cy="85" r="12" fill="#0F172A" />
                <circle cx="30" cy="85" r="5" fill="#E2E8F0" />
                <circle cx="110" cy="85" r="12" fill="#0F172A" />
                <circle cx="110" cy="85" r="5" fill="#E2E8F0" />
                <circle cx="155" cy="85" r="12" fill="#0F172A" />
                <circle cx="155" cy="85" r="5" fill="#E2E8F0" />
                {/* Cargo graphics */}
                <path d="M20 40 H120" stroke="#1D4ED8" strokeWidth="3" />
                <path d="M20 50 H120" stroke="#1D4ED8" strokeWidth="3" />
                <path d="M20 60 H120" stroke="#1D4ED8" strokeWidth="3" />
              </g>
              
              {/* Connection Node Rings */}
              <circle cx="200" cy="50" r="15" fill="#14B8A6" fillOpacity="0.2" />
              <circle cx="200" cy="50" r="6" fill="#14B8A6" />
              <circle cx="100" cy="250" r="10" fill="#3B82F6" fillOpacity="0.2" />
              <circle cx="100" cy="250" r="4" fill="#3B82F6" />
              <circle cx="300" cy="250" r="10" fill="#3B82F6" fillOpacity="0.2" />
              <circle cx="300" cy="250" r="4" fill="#3B82F6" />
            </svg>
            
            <div className="text-center max-w-sm space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">Smart Logistics Platform</h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect and manage your vehicle networks, safety thresholds, dispatches, and diagnostics on one unified, investor-grade console.
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="text-xs text-slate-500 flex justify-between items-center w-full">
            <span>© {new Date().getFullYear()} TransitOps</span>
            <span>All systems operational</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: CENTERED LOGIN CARD */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md space-y-8">
          {/* Header info */}
          <div className="text-center lg:text-left space-y-2.5">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
              Welcome back
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Log in to manage operations. Enter password other than "wrong" to test.
            </p>
          </div>

          {/* API ERROR ALERT */}
          {apiError && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/30 rounded-xl flex items-start space-x-3 text-rose-700 dark:text-rose-450">
              <ShieldAlert className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <span className="font-bold">Login Failed:</span> {apiError}
              </div>
            </div>
          )}

          {/* LOGIN CARD */}
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email */}
              <Input
                label="Email Address"
                placeholder="manager@transitops.com"
                icon={Mail}
                error={errors.email?.message}
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    required: true,
                    message: 'Please enter a valid email address',
                  },
                })}
              />

              {/* Password */}
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                icon={Lock}
                error={errors.password?.message}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 4,
                    message: 'Password must be at least 4 characters long',
                  },
                })}
              />

              {/* Remeber me & Forgot password */}
              <div className="flex items-center justify-between text-xs">
                <label className="flex items-center space-x-2 text-slate-655 dark:text-slate-400 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500/20"
                    {...register('rememberMe')}
                  />
                  <span>Remember Me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setForgotPasswordOpen(true)}
                  className="font-semibold text-blue-600 dark:text-blue-450 hover:underline"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit */}
              <Button type="submit" loading={loading} className="w-full py-3" icon={ArrowRight}>
                Log In to Platform
              </Button>
            </form>

            {/* SSO separator */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-500 dark:text-slate-450">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login UI Only */}
            <Button
              variant="outline"
              className="w-full py-2.5 font-semibold text-slate-700 dark:text-slate-300"
              onClick={() => {}}
            >
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
          </Card>

          {/* Quick role-based cheat-sheet */}
          <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-[11px] text-slate-500 space-y-1">
            <span className="font-bold block text-slate-700 dark:text-slate-350">Quick Role Access Emails (any password):</span>
            <ul className="grid grid-cols-2 gap-1 font-mono">
              <li>• Fleet Mgr: manager@transitops.com</li>
              <li>• Driver: driver@transitops.com</li>
              <li>• Safety: safety@transitops.com</li>
              <li>• Finance: finance@transitops.com</li>
            </ul>
          </div>

          {/* Footer links */}
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium px-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <span>•</span>
            <a href="#" className="hover:underline">Terms of Service</a>
            <span>•</span>
            <span>v1.0.0</span>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      <Modal isOpen={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)} title="Reset Password">
        <div className="space-y-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Enter your email address and we'll dispatch a link to reset your password.
          </p>
          <Input label="Email Address" placeholder="you@example.com" icon={Mail} />
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" onClick={() => setForgotPasswordOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => { setForgotPasswordOpen(false); }}>
              Send Link
            </Button>
          </div>
        </div>
      </Modal>

      {/* FAILED LOGIN ATTEMPT ALERT PREVIEW MODAL */}
      <Modal
        isOpen={failedLoginModalOpen}
        onClose={() => setFailedLoginModalOpen(false)}
        title="Email Alert Preview: Security Notification"
      >
        {failedAttemptDetails && (
          <div className="space-y-5">
            <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 text-left text-xs font-mono text-slate-655 dark:text-slate-400">
              <div><span className="font-bold text-slate-800 dark:text-slate-300">From:</span> security@transitops.com</div>
              <div><span className="font-bold text-slate-800 dark:text-slate-300">To:</span> {failedAttemptDetails.email}</div>
              <div><span className="font-bold text-slate-800 dark:text-slate-300">Subject:</span> Was this you?</div>
            </div>

            <div className="border border-slate-250 dark:border-slate-800 p-6 rounded-2xl bg-white dark:bg-slate-900 space-y-4 text-left shadow-sm">
              <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-455">
                <ShieldAlert className="w-6 h-6 flex-shrink-0" />
                <h4 className="text-sm font-bold">Unrecognized Sign-In Attempt</h4>
              </div>
              
              <div className="space-y-3.5 text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                <p>
                  Someone attempted to sign into your TransitOps account with an incorrect password.
                </p>
                <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-2 border border-slate-100 dark:border-slate-850 font-medium">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono">{failedAttemptDetails.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">IP Address:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-mono">{failedAttemptDetails.ipAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Browser:</span>
                    <span className="text-slate-900 dark:text-slate-200 truncate max-w-[200px]" title={failedAttemptDetails.browser}>
                      {failedAttemptDetails.browser}
                    </span>
                  </div>
                </div>
                <p>
                  If this wasn't you, please reset your password immediately to protect your logistics profile.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-center">
                <Button variant="danger" size="sm" onClick={() => setFailedLoginModalOpen(false)}>
                  Reset Password Instantly
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="outline" onClick={() => setFailedLoginModalOpen(false)}>
                Dismiss Preview
              </Button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
}
