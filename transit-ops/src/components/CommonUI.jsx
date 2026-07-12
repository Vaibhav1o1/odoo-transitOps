import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

// --- CARD ---
export const Card = ({ children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:border-blue-500 dark:hover:border-blue-400' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

// --- BUTTON ---
export const Button = ({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 shadow-sm shadow-blue-500/20',
    secondary: 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-slate-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm shadow-emerald-500/20',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm shadow-rose-500/20',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-500 shadow-sm shadow-amber-500/20',
    outline: 'border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 focus:ring-blue-500',
    ghost: 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 focus:ring-slate-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {!loading && Icon && <Icon className="w-4 h-4 mr-2" />}
      {children}
    </button>
  );
};

// --- INPUT ---
export const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder,
  error,
  icon: Icon,
  rightElement,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4.5 w-4.5" />
          </div>
        )}
        <input
          ref={ref}
          type={type}
          placeholder={placeholder}
          className={`block w-full rounded-xl border transition-all duration-200 text-sm py-2.5 px-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
            Icon ? 'pl-11' : ''
          } ${rightElement ? 'pr-11' : ''} ${
            error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : ''
          }`}
          {...props}
        />
        {rightElement && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-500 flex items-center font-medium">
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}
        </p>
      )}
    </div>
  );
});
Input.displayName = 'Input';

// --- TEXTAREA ---
export const Textarea = React.forwardRef(({ label, placeholder, error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        placeholder={placeholder}
        rows={3}
        className={`block w-full rounded-xl border transition-all duration-200 text-sm py-2.5 px-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-rose-500 focus:border-rose-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-xs text-rose-500 flex items-center font-medium">
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}
        </p>
      )}
    </div>
  );
});
Textarea.displayName = 'Textarea';

// --- SELECT ---
export const Select = React.forwardRef(({ label, options = [], error, className = '', ...props }, ref) => {
  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={`block w-full rounded-xl border transition-all duration-200 text-sm py-2.5 px-3.5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-50 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
          error ? 'border-rose-500 focus:border-rose-500' : ''
        }`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-xs text-rose-500 flex items-center font-medium">
          <AlertCircle className="w-3.5 h-3.5 mr-1" /> {error}
        </p>
      )}
    </div>
  );
});
Select.displayName = 'Select';

// --- BADGE ---
export const Badge = ({ children, variant = 'info' }) => {
  const styles = {
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/30',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-900/30',
    secondary: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${styles[variant]}`}>
      {children}
    </span>
  );
};

// --- AVATAR ---
export const Avatar = ({ name = '', role = '', size = 'md', className = '' }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`relative flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold tracking-wider ${sizes[size]} shadow-sm ${className}`}>
      {initials}
      {role && (
        <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 bg-green-400" />
      )}
    </div>
  );
};

// --- BREADCRUMB ---
export const Breadcrumb = ({ items = [] }) => {
  return (
    <nav className="flex text-sm text-slate-500 dark:text-slate-400 mb-4 overflow-x-auto whitespace-nowrap">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {items.map((item, idx) => (
          <li key={idx} className="inline-flex items-center">
            {idx > 0 && <span className="mx-2 text-slate-400 dark:text-slate-600">/</span>}
            {item.href ? (
              <a href={item.href} className="hover:text-blue-600 dark:hover:text-blue-400 font-medium">
                {item.label}
              </a>
            ) : (
              <span className="font-semibold text-slate-800 dark:text-slate-200">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// --- PAGINATION ---
export const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-250 dark:border-slate-850 bg-transparent sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Showing Page <span className="font-semibold text-slate-800 dark:text-slate-100">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-100">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-xs" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center rounded-l-md px-2.5 py-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const page = idx + 1;
              const isSelected = page === currentPage;
              return (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={`inline-flex items-center px-4 py-2 text-sm font-semibold border-t border-b border-transparent ${
                    isSelected
                      ? 'z-10 bg-blue-600 text-white focus-visible:outline-blue-600'
                      : 'text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-850'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center rounded-r-md px-2.5 py-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-850 disabled:opacity-40"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

// --- SEARCH BAR ---
export const SearchBar = ({ value, onChange, placeholder = 'Search...' }) => {
  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
        <Search className="h-4 w-4" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full pl-9 pr-8 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 text-sm text-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-250"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};

// --- STAT CARD ---
export const StatCard = ({ title, value, trend, percent, icon: Icon, color = 'blue' }) => {
  const colors = {
    blue: 'from-blue-500/10 to-indigo-500/5 text-blue-600 dark:text-blue-400',
    teal: 'from-teal-500/10 to-emerald-500/5 text-teal-600 dark:text-teal-400',
    green: 'from-green-500/10 to-emerald-500/5 text-green-600 dark:text-green-400',
    red: 'from-red-500/10 to-rose-500/5 text-rose-600 dark:text-rose-400',
    orange: 'from-amber-500/10 to-orange-500/5 text-amber-500 dark:text-amber-400',
  };

  const isUp = trend === 'up';

  return (
    <Card className="flex flex-col relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-200">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${colors[color]} rounded-full blur-2xl opacity-40 group-hover:scale-110 transition-transform`} />
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-450 uppercase tracking-wider">{title}</span>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colors[color]}`}>
          {Icon && <Icon className="w-5 h-5" />}
        </div>
      </div>
      <div className="flex items-baseline space-x-2">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          {value}
        </h3>
        {percent !== undefined && (
          <span className={`inline-flex items-center text-xs font-semibold ${isUp ? 'text-green-600 dark:text-green-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {isUp ? '+' : '-'}{percent}%
          </span>
        )}
      </div>
    </Card>
  );
};

// --- LOADING SKELETON ---
export const Skeleton = ({ variant = 'line', className = '' }) => {
  const styles = {
    line: 'h-4 w-full rounded-md',
    circle: 'rounded-full',
    card: 'h-32 w-full rounded-2xl',
    chart: 'h-64 w-full rounded-2xl',
    table: 'h-10 w-full rounded-lg',
  };

  return (
    <div className={`bg-slate-200 dark:bg-slate-800 animate-pulse ${styles[variant]} ${className}`} />
  );
};

// --- TOAST NOTIFICATIONS ---
export const Toast = ({ message, type = 'info', onClose }) => {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500" />,
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    danger: <AlertCircle className="w-5 h-5 text-rose-500" />,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="flex items-center p-4 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-sm"
    >
      <div className="mr-3 flex-shrink-0">{icons[type]}</div>
      <div className="flex-1 text-sm font-medium text-slate-850 dark:text-slate-200">{message}</div>
      <button onClick={onClose} className="ml-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};
