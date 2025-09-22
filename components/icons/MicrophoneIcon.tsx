import React from 'react';

export const MicrophoneIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 18.75a6 6 0 006-6v-1.5a6 6 0 00-12 0v1.5a6 6 0 006 6zM12 12.75a3 3 0 003-3v-1.5a3 3 0 00-6 0v1.5a3 3 0 003 3z"
    />
    <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 12v.75a7.5 7.5 0 01-15 0V12"
    />
     <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75v2.25m0-11.25v-1.5"
    />
  </svg>
);
