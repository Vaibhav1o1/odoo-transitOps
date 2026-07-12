import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MotionLink = motion.create(Link);

const VARIANTS = {
  primary:
    'bg-gradient-primary text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.6)] hover:shadow-[0_10px_30px_-6px_rgba(37,99,235,0.75)]',
  outline:
    'bg-transparent text-ink border border-border-strong hover:border-secondary/60 hover:bg-white/5',
  ghost: 'bg-transparent text-ink-muted hover:text-ink hover:bg-white/5',
};

const SIZES = {
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

/**
 * Button with a Material-style ripple on click and a subtle hover/press
 * lift. Renders a react-router <Link> when `to` is passed, a plain <a>
 * when `href` is passed, otherwise a <button>.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  onClick,
  className = '',
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  ...rest
}) {
  const [ripples, setRipples] = useState([]);

  function handleClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const rippleSize = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - rippleSize / 2;
    const y = e.clientY - rect.top - rippleSize / 2;
    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y, size: rippleSize }]);
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 650);
    onClick?.(e);
  }

  const classes = `relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-medium tracking-tight transition-all duration-200 active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none ${VARIANTS[variant]} ${SIZES[size]} ${className}`;

  const content = (
    <>
      {Icon && iconPosition === 'left' && <Icon size={17} strokeWidth={2.2} />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon size={17} strokeWidth={2.2} />}
      {ripples.map((r) => (
        <span
          key={r.id}
          className="ripple-span"
          style={{ left: r.x, top: r.y, width: r.size, height: r.size }}
        />
      ))}
    </>
  );

  const motionProps = {
    whileHover: { y: -1 },
    whileTap: { scale: 0.97 },
  };

  if (to) {
    return (
      <MotionLink to={to} onClick={handleClick} className={classes} {...motionProps} {...rest}>
        {content}
      </MotionLink>
    );
  }

  if (href) {
    return (
      <motion.a href={href} onClick={handleClick} className={classes} {...motionProps} {...rest}>
        {content}
      </motion.a>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={handleClick}
      className={classes}
      {...motionProps}
      {...rest}
    >
      {content}
    </motion.button>
  );
}
