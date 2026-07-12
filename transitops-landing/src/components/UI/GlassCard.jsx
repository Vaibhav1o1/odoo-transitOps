/**
 * A glassmorphism panel. `strong` uses heavier blur/opacity for
 * foreground surfaces like the login card; the default is for
 * lighter in-flow cards like feature tiles.
 */
export default function GlassCard({ children, className = '', strong = false, as: Tag = 'div', ...rest }) {
  return (
    <Tag
      className={`${strong ? 'glass-strong' : 'glass'} rounded-2xl ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  );
}
