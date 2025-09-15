import React from 'react';

export const FlaskIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M19.5 12c0-3.32-2.26-6.11-5.32-6.88.24-.31.39-.68.39-1.09 0-1.1-.9-2-2-2s-2 .9-2 2c0 .41.15.78.39 1.09C7.76 5.89 5.5 8.68 5.5 12c0 3.14 2.1 5.79 5 6.7V21h3v-2.3c2.9-.91 5-3.56 5-6.7zM12 12H7"
    />
  </svg>
);