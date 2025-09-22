import React from 'react';

export const ThumbsDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24" 
        strokeWidth={2} 
        stroke="currentColor" 
        {...props}
    >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15V16.892c0 1.135.845 2.098 1.976 2.192.373.03.748.03 1.123 0 1.131-.094 1.976-1.057 1.976-2.192V15M8.25 15h8.25m-8.25 0V12m8.25 0V15m0-3V8.625c0-.621-.504-1.125-1.125-1.125h-6.75c-.621 0-1.125.504-1.125 1.125V12m0 0h12.375a2.25 2.25 0 002.25-2.25V7.5a2.25 2.25 0 00-2.25-2.25h-1.5M12 12h.008v.008H12V12zm-3.75 0h.008v.008H8.25V12z" />
    </svg>
);