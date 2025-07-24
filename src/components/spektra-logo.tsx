
import * as React from 'react';

export function SpektraLogo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex items-center gap-3" {...props}>
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-primary flex-shrink-0"
      >
        <path
          d="M12 2L2 12L12 22L22 12L12 2Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div>
        <span className="font-semibold text-foreground tracking-wider">SPEKTRA</span>
        <p className="text-xs text-muted-foreground" style={{whiteSpace: 'nowrap'}}>
            Spektrum Data Connector
        </p>
      </div>
    </div>
  );
}
