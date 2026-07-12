import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Truck, Map, ShieldCheck, DollarSign, BarChart3, Wrench, ArrowRight } from 'lucide-react';
import { Button } from '../components/CommonUI';

export default function Landing() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const features = [
    { title: 'Fleet Tracking', description: 'Monitor registration numbers, statuses (Available, On Trip, In Shop), and locations in real-time.', icon: Truck, color: 'text-blue-600 bg-blue-500/10' },
    { title: 'Smart Trip Timeline', description: 'Track dispatches from Draft to Dispatched, Completed, and Cancelled with a visual stepping log.', icon: Map, color: 'text-teal-650 bg-teal-500/10' },
    { title: 'Fuel & Expense Audit', description: 'Automate tracking for fuel, tolls, and maintenance with interactive expense breakdown analytics.', icon: DollarSign, color: 'text-amber-600 bg-amber-500/10' },
    { title: 'Intelligent Maintenance', description: 'Assign tickets, set criticalities, and trace repairs to minimize downtime and shop costs.', icon: Wrench, color: 'text-rose-650 bg-rose-500/10' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col justify-between overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="h-20 max-w-7xl w-full mx-auto px-6 flex items-center justify-between z-10">
        <div className="flex items-center space-x-2.5">
          <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center font-black text-lg">
            TO
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-50 dark:to-slate-350 bg-clip-text text-transparent">
            TransitOps
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </nav>

      {/* HERO SECTION */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 flex flex-col justify-center py-12 md:py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-4xl mx-auto space-y-8"
        >
          {/* Tag */}
          <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-200/20 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-400">
            <span>v1.0.0 Release - Smart Transport Operations Platform</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 leading-tight"
          >
            Streamline your fleet.<br />
            <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">
              Scale your logistics.
            </span>
          </motion.h1>

          {/* Paragraph */}
          <motion.p
            variants={itemVariants}
            className="text-lg text-slate-550 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            The premium Smart Transport Operations Platform for real-time tracking, safety scoring, driver dispatches, maintenance logs, and financial intelligence. Built for modern operators.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              icon={ArrowRight}
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto"
            >
              Launch Platform
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open('https://github.com', '_blank')}
              className="w-full sm:w-auto"
            >
              Request Enterprise Demo
            </Button>
          </motion.div>
        </motion.div>

        {/* FEATURES GRID */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20"
        >
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`p-3 rounded-xl inline-block ${feat.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </motion.div>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 dark:border-slate-850 py-8 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400">
          <p>© {new Date().getFullYear()} TransitOps Platform. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0 font-medium">
            <a href="#" className="hover:text-blue-500">Privacy Policy</a>
            <a href="#" className="hover:text-blue-500">Terms of Service</a>
            <span>v1.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
