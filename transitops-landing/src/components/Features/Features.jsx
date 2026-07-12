import {
  Truck,
  ClipboardList,
  Route,
  Wrench,
  ShieldCheck,
  Fuel,
  Receipt,
  BarChart3,
} from 'lucide-react';
import Container from '../UI/Container.jsx';
import SectionHeading from '../UI/SectionHeading.jsx';
import FeatureCard from './FeatureCard.jsx';

const FEATURES = [
  {
    icon: Truck,
    title: 'Fleet Management',
    description: 'Monitor every vehicle in real time with a unified operations view.',
  },
  {
    icon: ClipboardList,
    title: 'Vehicle Registry',
    description: 'Centralize registration, documents and lifecycle records per asset.',
  },
  {
    icon: Route,
    title: 'Trip Dispatch',
    description: 'Assign routes and drivers instantly with intelligent dispatching.',
  },
  {
    icon: Wrench,
    title: 'Maintenance Tracking',
    description: 'Schedule service and catch issues before they become downtime.',
  },
  {
    icon: ShieldCheck,
    title: 'Driver Compliance',
    description: 'Keep licenses, certifications and safety checks always current.',
  },
  {
    icon: Fuel,
    title: 'Fuel Tracking',
    description: 'Track consumption patterns and flag anomalies across the fleet.',
  },
  {
    icon: Receipt,
    title: 'Expense Management',
    description: 'Capture and categorize operational spend with full visibility.',
  },
  {
    icon: BarChart3,
    title: 'Operational Analytics',
    description: 'Turn fleet data into decisions with live dashboards and reports.',
  },
];

export default function Features() {
  return (
    <section id="features" className="relative py-24">
      <Container className="flex flex-col gap-14">
        <SectionHeading
          eyebrow="Platform"
          title="Everything your operations team needs"
          subtitle="A complete toolkit for running a modern transport operation — from dispatch to reporting."
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={feature.title} index={i} {...feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
