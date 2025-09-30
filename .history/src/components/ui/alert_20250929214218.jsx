import React from 'react';

const Alert = ({ children, className = '' }) => {
  return (
    <div
      className={`relative w-full rounded-lg border p-4 bg-background text-foreground [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`}
    >
      {children}
    </div>
  );
};

const AlertDescription = ({ children, className = '' }) => {
  return (
    <div className={`text-sm [&_p]:leading-relaxed ${className}`}>
      {children}
    </div>
  );
};

export { Alert, AlertDescription };