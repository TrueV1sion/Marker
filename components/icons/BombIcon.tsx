import React from 'react';

export const BombIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 110-18 9 9 0 010 18z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121a3 3 0 11-4.242-4.242 3 3 0 014.242 4.242z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 4.01V2m0 2h2m-2 0l1.41-1.41" />
  </svg>
);
