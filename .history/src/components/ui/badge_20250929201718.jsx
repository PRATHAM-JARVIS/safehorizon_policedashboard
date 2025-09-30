import React from 'react';

export const Badge = React.forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-primary hover:bg-primary/80 text-primary-foreground',
    secondary: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground',
    destructive: 'bg-destructive hover:bg-destructive/80 text-destructive-foreground',
    outline: 'text-foreground border border-input',
    success: 'bg-green-500 hover:bg-green-500/80 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-500/80 text-white',
    critical: 'bg-red-500 hover:bg-red-500/80 text-white',
  };

  return (
    <div
      ref={ref}
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variants[variant]} ${className}`}
      {...props}
    />
  );
});
Badge.displayName = 'Badge';