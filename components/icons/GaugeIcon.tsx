import React from 'react';

export const GaugeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
      d="M11.343 3.343a8 8 0 1011.314 11.314m-11.314-11.314L22.657 14.657m-11.314-11.314v11.314h11.314"
    />
     <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12l-8.485 8.485"
    />
  </svg>
);