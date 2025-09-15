
import React from 'react';

export const ShareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.684 13.342C8.844 13.134 9 12.871 9 12.59V9.525c0-.988.626-1.813 1.5-2.121a3 3 0 013 0c.874.308 1.5.143 1.5 2.121v3.065c0 .281.156.544.316.75l.75 1.5a.5.5 0 00.784-.408V12.59c0-2.3-1.6-4.16-3.75-4.522a4.5 4.5 0 00-5.5 0C6.1 8.43 4.5 10.29 4.5 12.59v2.242a.5.5 0 00.784.408l.75-1.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 15.75h.008v.008H12v-.008z"
    />
  </svg>
);
