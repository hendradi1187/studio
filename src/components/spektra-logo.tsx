import * as React from 'react';

export function SpektraLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      width="110"
      height="28"
      viewBox="0 0 110 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <text 
        x="0" 
        y="20" 
        fontFamily="Arial, sans-serif" 
        fontSize="24" 
        fontWeight="bold" 
        fill="currentColor"
      >
        SPEKTRA
      </text>
    </svg>
  );
}
