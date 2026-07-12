import { motion } from 'framer-motion';

export default function LoginFeatureCard({ icon: Icon, title, description, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
      className="flex items-start gap-3.5 rounded-xl border border-white/15 bg-white/[0.06] p-4 backdrop-blur-sm"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <Icon size={18} className="text-white" strokeWidth={2} />
      </span>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="text-xs leading-relaxed text-white/70">{description}</p>
      </div>
    </motion.div>
  );
}
