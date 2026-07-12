import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Truck, LayoutDashboard, ShieldCheck, BarChart3 } from 'lucide-react';
import LoginFeatureCard from './LoginFeatureCard.jsx';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Fleet Management',
    description: 'Real-time visibility across every vehicle and route.',
  },
  {
    icon: ShieldCheck,
    title: 'Driver Compliance',
    description: 'Licenses and certifications tracked automatically.',
  },
  {
    icon: BarChart3,
    title: 'Operational Analytics',
    description: 'Turn operational data into clear decisions.',
  },
];

export default function LoginLeftPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-gradient-primary lg:flex lg:w-1/2">
      <div
        className="blob left-[-10%] top-[-10%] h-[380px] w-[380px] bg-white/20"
        aria-hidden="true"
      />
      <div
        className="blob bottom-[-15%] right-[-10%] h-[420px] w-[420px] bg-[#05070d]/30"
        aria-hidden="true"
      />

      <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/15">
              <Truck size={20} className="text-white" strokeWidth={2.4} />
            </span>
            <span className="text-xl font-bold tracking-tight text-white">TransitOps</span>
          </Link>
        </motion.div>

        <div className="flex flex-col gap-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
              Run your entire fleet from a single platform.
            </h2>
            <p className="max-w-sm text-sm text-white/75">
              Sign in to access dispatching, compliance and analytics tools
              built for transport operations teams.
            </p>
          </motion.div>

          <div className="flex flex-col gap-3.5">
            {FEATURES.map((f, i) => (
              <LoginFeatureCard key={f.title} index={i} {...f} />
            ))}
          </div>
        </div>

        <p className="text-xs text-white/50">
          © {new Date().getFullYear()} TransitOps. All rights reserved.
        </p>
      </div>
    </div>
  );
}
