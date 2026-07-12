import { Truck, UserRound, ShieldCheck, LineChart } from 'lucide-react';

const ROLES = [
  { icon: Truck, label: 'Fleet Manager' },
  { icon: UserRound, label: 'Driver' },
  { icon: ShieldCheck, label: 'Safety Officer' },
  { icon: LineChart, label: 'Financial Analyst' },
];

export default function RolesList() {
  return (
    <div>
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-ink-faint">
        Available Roles
      </p>
      <div className="grid grid-cols-2 gap-2.5">
        {ROLES.map((role) => (
          <div
            key={role.label}
            className="flex items-center gap-2 rounded-lg border border-border-soft bg-white/[0.03] px-3 py-2.5 text-xs font-medium text-ink-muted transition-colors duration-200 hover:border-secondary/40 hover:text-ink"
          >
            <role.icon size={14} className="text-secondary" />
            {role.label}
          </div>
        ))}
      </div>
    </div>
  );
}
