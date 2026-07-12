import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Button from '../UI/Button.jsx';
import GlassCard from '../UI/GlassCard.jsx';
import RolesList from './RolesList.jsx';

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // UI only — no backend wired up yet.
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="w-full max-w-md"
    >
      <GlassCard strong className="p-8 sm:p-9">
        <div className="mb-7">
          <h1 className="text-2xl font-bold tracking-tight text-ink">Welcome Back</h1>
          <p className="mt-1.5 text-sm text-ink-muted">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Email</span>
            <div className="flex items-center gap-2.5 rounded-xl border border-border-soft bg-white/[0.03] px-3.5 py-3 transition-colors duration-200 focus-within:border-secondary/50">
              <Mail size={16} className="text-ink-faint" />
              <input
                type="email"
                required
                placeholder="you@company.com"
                autoComplete="email"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-ink-muted">Password</span>
            <div className="flex items-center gap-2.5 rounded-xl border border-border-soft bg-white/[0.03] px-3.5 py-3 transition-colors duration-200 focus-within:border-secondary/50">
              <Lock size={16} className="text-ink-faint" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-transparent text-sm text-ink placeholder:text-ink-faint focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-ink-faint transition-colors hover:text-ink-muted"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <div className="flex items-center justify-between pt-1">
            <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-3.5 w-3.5 rounded border-border-strong bg-transparent accent-primary"
              />
              Remember Me
            </label>
            <a href="#" className="text-xs font-medium text-secondary hover:text-secondary/80">
              Forgot Password?
            </a>
          </div>

          <Button type="submit" variant="primary" size="lg" icon={ArrowRight} className="mt-2 w-full">
            Login
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-border-soft" />
          <span className="text-xs text-ink-faint">OR</span>
          <span className="h-px flex-1 bg-border-soft" />
        </div>

        <button
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-border-soft bg-white/[0.03] py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-white/[0.06]"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <div className="mt-8 border-t border-border-soft pt-6">
          <RolesList />
        </div>
      </GlassCard>

      <p className="mt-6 text-center text-sm text-ink-faint">
        <Link to="/" className="font-medium text-ink-muted hover:text-ink">
          ← Back to Home
        </Link>
      </p>
    </motion.div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.54-5.17 3.54-8.87z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.07.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.93H1.3v3.09A12 12 0 0 0 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.31A7.2 7.2 0 0 1 4.93 12c0-.8.14-1.58.38-2.31V6.6H1.3A12 12 0 0 0 0 12c0 1.94.46 3.77 1.3 5.4z"
      />
      <path
        fill="#EA4335"
        d="M12 4.76c1.77 0 3.35.61 4.6 1.8l3.44-3.44C17.94 1.19 15.24 0 12 0A12 12 0 0 0 1.3 6.6l4.01 3.09C6.25 6.86 8.89 4.76 12 4.76z"
      />
    </svg>
  );
}
