import { motion } from 'framer-motion';
import { TrendingUp, MapPin, Fuel, Truck, CheckCircle2 } from 'lucide-react';
import GlassCard from '../UI/GlassCard.jsx';

const BARS = [40, 65, 45, 80, 55, 90, 70];

export default function DashboardIllustration() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
      className="relative mx-auto w-full max-w-lg"
    >
      {/* Main panel */}
      <GlassCard strong className="relative z-10 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-ink-faint">Fleet Overview</p>
            <p className="text-lg font-bold text-ink">Live Operations</p>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>

        {/* Bar chart */}
        <div className="mb-5 flex h-28 items-end gap-2">
          {BARS.map((h, i) => (
            <motion.div
              key={i}
              initial={{ height: 0 }}
              animate={{ height: `${h}%` }}
              transition={{ duration: 0.6, delay: 0.4 + i * 0.06, ease: 'easeOut' }}
              className="flex-1 rounded-t-md bg-gradient-primary opacity-80"
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-border-soft bg-white/5 p-3">
            <TrendingUp size={16} className="mb-1.5 text-secondary" />
            <p className="text-lg font-bold text-ink">92%</p>
            <p className="text-xs text-ink-faint">Utilization</p>
          </div>
          <div className="rounded-xl border border-border-soft bg-white/5 p-3">
            <Fuel size={16} className="mb-1.5 text-secondary" />
            <p className="text-lg font-bold text-ink">-14%</p>
            <p className="text-xs text-ink-faint">Fuel cost</p>
          </div>
        </div>
      </GlassCard>

      {/* Floating card: active trip */}
      <motion.div
        className="animate-float absolute -left-10 top-6 z-20 hidden sm:block"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <GlassCard className="flex items-center gap-3 px-4 py-3 shadow-xl shadow-black/30">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20">
            <MapPin size={16} className="text-primary-light" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink">Trip #4821</p>
            <p className="text-[11px] text-ink-faint">En route · 12 min</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Floating card: driver compliance */}
      <motion.div
        className="animate-float-delayed absolute -bottom-8 -right-6 z-20 hidden sm:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.75 }}
      >
        <GlassCard className="flex items-center gap-3 px-4 py-3 shadow-xl shadow-black/30">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-400/15">
            <CheckCircle2 size={16} className="text-emerald-400" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink">Compliance</p>
            <p className="text-[11px] text-ink-faint">180 drivers verified</p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Floating card: vehicle count */}
      <motion.div
        className="animate-float-slow absolute -right-8 top-1/2 z-20 hidden -translate-y-1/2 lg:block"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        <GlassCard className="flex items-center gap-3 px-4 py-3 shadow-xl shadow-black/30">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/15">
            <Truck size={16} className="text-secondary" />
          </span>
          <div>
            <p className="text-xs font-medium text-ink">Fleet size</p>
            <p className="text-[11px] text-ink-faint">250 vehicles active</p>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
}
