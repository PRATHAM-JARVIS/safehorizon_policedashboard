import React from 'react';

export const Table = React.forwardRef(({ className = '', ...props }, ref) => (
  <div className="w-full overflow-auto rounded-lg border border-border/50 bg-card shadow-sm">
    <table
      ref={ref}
      className={`w-full caption-bottom text-sm border-collapse ${className}`}
      {...props}
    />
  </div>
));
Table.displayName = 'Table';

export const TableHeader = React.forwardRef(({ className = '', ...props }, ref) => (
  <thead ref={ref} className={`bg-gradient-to-r from-muted/50 to-muted/30 [&_tr]:border-b [&_tr]:border-border/50 ${className}`} {...props} />
));
TableHeader.displayName = 'TableHeader';

export const TableBody = React.forwardRef(({ className = '', ...props }, ref) => (
  <tbody
    ref={ref}
    className={`[&_tr:last-child]:border-0 divide-y divide-border/50 ${className}`}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

export const TableFooter = React.forwardRef(({ className = '', ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`bg-gradient-to-r from-primary/10 to-primary/5 font-medium text-foreground border-t border-border/50 ${className}`}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

export const TableRow = React.forwardRef(({ className = '', ...props }, ref) => (
  <tr
    ref={ref}
    className={`transition-all duration-200 hover:bg-accent/30 hover:shadow-sm data-[state=selected]:bg-primary/10 data-[state=selected]:shadow-md ${className}`}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

export const TableHead = React.forwardRef(({ className = '', ...props }, ref) => (
  <th
    ref={ref}
    className={`h-14 px-6 text-left align-middle font-semibold text-muted-foreground uppercase tracking-wider text-xs [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

export const TableCell = React.forwardRef(({ className = '', ...props }, ref) => (
  <td
    ref={ref}
    className={`px-6 py-4 align-middle font-medium [&:has([role=checkbox])]:pr-0 ${className}`}
    {...props}
  />
));
TableCell.displayName = 'TableCell';