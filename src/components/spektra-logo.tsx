import * as React from 'react';

export function SpektraLogo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex items-center gap-2" {...props}>
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
      </svg>
      <span className="font-semibold text-foreground">SPEKTRA</span>
    </div>
  );
}
