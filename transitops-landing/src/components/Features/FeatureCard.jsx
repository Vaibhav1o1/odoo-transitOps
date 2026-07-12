import { motion } from 'framer-motion';
import GlassCard from '../UI/GlassCard.jsx';

export default function FeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 4) * 0.08 }}
    >
      <GlassCard className="group flex h-full flex-col gap-4 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-secondary/40">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-primary transition-transform duration-300 group-hover:scale-105">
          <Icon size={20} className="text-white" strokeWidth={2} />
        </span>
        <div>
          <h3 className="mb-1.5 text-base font-semibold text-ink">{title}</h3>
          <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
        </div>
      </GlassCard>
    </motion.div>
  );
}
