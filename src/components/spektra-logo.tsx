import * as React from 'react';

export function SpektraLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary"
      >
        <path
          d="M12 2L2 12L12 22L22 12L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="12" y1="2" x2="12" y2="6" stroke="currentColor" strokeWidth="2" />
        <line x1="12" y1="18" x2="12" y2="22" stroke="currentColor" strokeWidth="2" />
        <line x1="2" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="2" />
        <line x1="18" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
      </svg>
       <span className="font-semibold text-foreground">SPEKTRA</span>
    </div>
  );
}
