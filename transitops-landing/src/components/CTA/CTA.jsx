import { motion } from 'framer-motion';
import { ArrowRight, PhoneCall } from 'lucide-react';
import Container from '../UI/Container.jsx';
import GlassCard from '../UI/GlassCard.jsx';
import Button from '../UI/Button.jsx';

export default function CTA() {
  return (
    <section className="relative py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
        >
          <GlassCard strong className="relative overflow-hidden px-8 py-16 text-center sm:px-16">
            <div
              className="blob left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 bg-primary/25"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-center gap-6">
              <h2 className="max-w-xl text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                Ready to Optimize Your Fleet?
              </h2>
              <p className="max-w-md text-base text-ink-muted">
                Join transport teams running smarter, safer and more efficient
                operations with TransitOps.
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
                <Button to="/login" variant="primary" size="lg" icon={ArrowRight}>
                  Start Free
                </Button>
                <Button variant="outline" size="lg" icon={PhoneCall} iconPosition="left">
                  Contact Sales
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </Container>
    </section>
  );
}
