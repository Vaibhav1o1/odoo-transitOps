import { motion } from 'framer-motion';
import { Truck, Users, Gauge, Route } from 'lucide-react';
import Container from '../UI/Container.jsx';
import GlassCard from '../UI/GlassCard.jsx';
import AnimatedCounter from './AnimatedCounter.jsx';

const STATS = [
  { icon: Truck, value: 250, suffix: '+', label: 'Vehicles' },
  { icon: Users, value: 180, suffix: '+', label: 'Drivers' },
  { icon: Gauge, value: 92, suffix: '%', label: 'Fleet Utilization' },
  { icon: Route, value: 1.4, suffix: 'K+', decimals: 1, label: 'Trips Completed' },
];

export default function Statistics() {
  return (
    <section id="solutions" className="relative py-20">
      <Container>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <GlassCard className="flex flex-col items-center gap-2.5 px-4 py-8 text-center transition-transform duration-300 hover:-translate-y-1">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
                  <stat.icon size={20} className="text-secondary" />
                </span>
                <p className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
                </p>
                <p className="text-sm text-ink-muted">{stat.label}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
