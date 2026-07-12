import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal } from 'lucide-react';
import Container from '../UI/Container.jsx';
import SectionHeading from '../UI/SectionHeading.jsx';
import GlassCard from '../UI/GlassCard.jsx';

const KPIS = [
  { label: 'Active Trips', value: '128', delta: '+8.2%', up: true },
  { label: 'Avg. Delivery Time', value: '34m', delta: '-4.1%', up: true },
  { label: 'Fuel Efficiency', value: '7.8 km/l', delta: '+2.6%', up: true },
  { label: 'Incident Rate', value: '0.4%', delta: '-1.2%', up: true },
];

const WEEKLY = [55, 70, 48, 82, 63, 91, 76];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const REGIONS = [
  { name: 'North Zone', value: 82 },
  { name: 'East Zone', value: 64 },
  { name: 'South Zone', value: 71 },
  { name: 'West Zone', value: 48 },
];

export default function DashboardPreview() {
  return (
    <section id="analytics" className="relative py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Analytics"
          title="Operational insight, at a glance"
          subtitle="A live snapshot of the dashboard your team works in every day."
        />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard strong className="p-5 sm:p-8">
            {/* KPI row */}
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {KPIS.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-xl border border-border-soft bg-white/[0.03] p-4"
                >
                  <p className="mb-1.5 text-xs text-ink-faint">{kpi.label}</p>
                  <p className="mb-1 text-xl font-bold text-ink">{kpi.value}</p>
                  <span
                    className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                      kpi.up ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {kpi.up ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                    {kpi.delta}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-5">
              {/* Weekly trips chart */}
              <div className="rounded-xl border border-border-soft bg-white/[0.03] p-5 lg:col-span-3">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-ink">Trips this week</p>
                    <p className="text-xs text-ink-faint">Completed vs. scheduled</p>
                  </div>
                  <MoreHorizontal size={16} className="text-ink-faint" />
                </div>
                <div className="flex h-40 items-end gap-3">
                  {WEEKLY.map((h, i) => (
                    <div key={DAYS[i]} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: i * 0.06, ease: 'easeOut' }}
                        className="flex w-full items-end"
                        style={{ height: '100%' }}
                      >
                        <div className="w-full rounded-t-md bg-gradient-primary" style={{ height: `${h}%` }} />
                      </motion.div>
                      <span className="text-[11px] text-ink-faint">{DAYS[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regional load */}
              <div className="rounded-xl border border-border-soft bg-white/[0.03] p-5 lg:col-span-2">
                <p className="mb-5 text-sm font-semibold text-ink">Regional load</p>
                <div className="flex flex-col gap-4">
                  {REGIONS.map((region, i) => (
                    <div key={region.name}>
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-ink-muted">{region.name}</span>
                        <span className="font-medium text-ink">{region.value}%</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${region.value}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
}
