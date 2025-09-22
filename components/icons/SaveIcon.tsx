import React from 'react';

export const SaveIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
    {...props}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3.75H6.912a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.641V16.5a2.25 2.25 0 002.25 2.25h13.5A2.25 2.25 0 0021 16.5v-2.682a2.25 2.25 0 00-.1-.64l-2.312-7.84a2.25 2.25 0 00-2.15-1.588H15M2.25 13.5h19.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 9H9v6h6V9z" />
  </svg>
);
