import { motion } from 'framer-motion';

export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignment = align === 'center' ? 'items-center text-center mx-auto' : 'items-start text-left';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`flex max-w-2xl flex-col gap-4 ${alignment}`}
    >
      {eyebrow && (
        <span className="inline-flex w-fit items-center rounded-full border border-border-soft bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-wider text-secondary">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="text-base leading-relaxed text-ink-muted">{subtitle}</p>}
    </motion.div>
  );
}
