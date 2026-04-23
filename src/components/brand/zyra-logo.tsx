import React from 'react';

interface ZyraLogoProps {
  className?: string;
}

export function ZyraLogo({ className = "h-8 w-8" }: ZyraLogoProps) {
  return (
    <svg 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >
      <defs>
        <linearGradient id="zyraGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="hsl(var(--accent))" />
          <stop offset="100%" stopColor="hsl(var(--primary))" />
        </linearGradient>
      </defs>
      
      {/* Background Rounded Square */}
      <rect width="100" height="100" rx="22" fill="url(#zyraGradient)" />
      
      {/* Sun Icon */}
      <circle cx="78" cy="22" r="6" fill="white" />
      <path d="M78 12V14M78 30V32M88 22H86M70 22H68M85.1 14.9L83.7 16.3M72.3 27.7L70.9 29.1M85.1 29.1L83.7 27.7M72.3 14.9L70.9 16.3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      
      {/* Solar Panel Grid Elements (Stylized) */}
      <path d="M25 45L45 40L42 55L20 60Z" fill="white" fillOpacity="0.3" />
      <path d="M48 40L72 35L75 50L51 55Z" fill="white" fillOpacity="0.3" />
      <path d="M18 62L40 57L37 72L12 77Z" fill="white" fillOpacity="0.2" />
      <path d="M43 57L75 52L82 67L48 72Z" fill="white" fillOpacity="0.2" />
      
      {/* Main Stylized Z */}
      <path 
        d="M25 25H75L25 75H75" 
        stroke="white" 
        strokeWidth="12" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
