import { motion } from 'framer-motion';
import { ArrowRight, PlayCircle } from 'lucide-react';
import Container from '../UI/Container.jsx';
import Button from '../UI/Button.jsx';
import DashboardIllustration from './DashboardIllustration.jsx';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pb-24 pt-40 lg:pb-32 lg:pt-48">
      {/* Blurred gradient background blobs */}
      <div
        className="blob left-[-10%] top-[-10%] h-[420px] w-[420px] bg-primary/30"
        aria-hidden="true"
      />
      <div
        className="blob right-[-8%] top-[10%] h-[380px] w-[380px] bg-secondary/25"
        aria-hidden="true"
      />
      <div
        className="blob bottom-[-15%] left-[30%] h-[320px] w-[320px] bg-primary/15"
        aria-hidden="true"
      />

      <Container className="relative grid items-center gap-16 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col items-start gap-7">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center rounded-full border border-border-soft bg-white/5 px-3.5 py-1.5 text-xs font-medium text-secondary"
          >
            Built for modern fleet operations
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]"
          >
            Smarter Fleet <span className="text-gradient">Management</span> Starts
            Here.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-lg text-base leading-relaxed text-ink-muted sm:text-lg"
          >
            Manage vehicles, drivers, dispatching, maintenance, expenses and
            operational analytics from one intelligent platform.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button to="/login" variant="primary" size="lg" icon={ArrowRight}>
              Get Started
            </Button>
            <Button variant="outline" size="lg" icon={PlayCircle} iconPosition="left">
              Watch Demo
            </Button>
          </motion.div>
        </div>

        <DashboardIllustration />
      </Container>
    </section>
  );
}
