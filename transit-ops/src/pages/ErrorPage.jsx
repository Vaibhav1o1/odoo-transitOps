import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, ShieldAlert, EyeOff } from 'lucide-react';
import { Button } from '../components/CommonUI';

export default function ErrorPage({ code = 404 }) {
  const navigate = useNavigate();

  const details = {
    401: {
      title: 'Authentication Required',
      description: 'You must be logged in to access this page. Please sign in with your credentials.',
      icon: EyeOff,
      color: 'text-amber-500 bg-amber-500/10 dark:bg-amber-500/5',
    },
    403: {
      title: 'Access Forbidden',
      description: 'Your security clearance level does not permit access to this section. Contact your Fleet Manager for permissions.',
      icon: ShieldAlert,
      color: 'text-rose-500 bg-rose-500/10 dark:bg-rose-500/5',
    },
    404: {
      title: 'Page Not Found',
      description: "We looked everywhere, but we couldn't find the route you were searching for. It might have been relocated or deleted.",
      icon: AlertCircle,
      color: 'text-blue-600 bg-blue-500/10 dark:bg-blue-500/5',
    },
  };

  const { title, description, icon: Icon, color } = details[code] || details[404];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="w-full max-w-md text-center space-y-6">
        {/* Illustration Icon */}
        <div className="flex justify-center">
          <div className={`p-6 rounded-3xl ${color} flex items-center justify-center relative`}>
            <div className="absolute inset-0 rounded-3xl blur-md opacity-20 bg-current" />
            <Icon className="w-16 h-16" />
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-2">
          <h1 className="text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {code}
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
            {title}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed px-4">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            icon={ArrowLeft}
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto"
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            icon={Home}
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto"
          >
            Return Home
          </Button>
        </div>
      </div>
    </div>
  );
}
