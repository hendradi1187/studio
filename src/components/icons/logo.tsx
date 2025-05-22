import type { SVGProps } from 'react';

export function RemedyEyeLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="150"
      height="37.5" // Adjusted to maintain aspect ratio with width 150
      {...props}
    >
      <rect width="200" height="50" fill="hsl(var(--primary))" rx="5" />
      <circle cx="30" cy="25" r="12" fill="hsl(var(--background))" />
      <circle cx="30" cy="25" r="6" fill="hsl(var(--accent))" />
      <text
        x="60"
        y="32"
        fontFamily="var(--font-geist-sans), Arial, sans-serif"
        fontSize="24"
        fontWeight="bold"
        fill="hsl(var(--primary-foreground))"
      >
        RemedyEye
      </text>
    </svg>
  );
}
