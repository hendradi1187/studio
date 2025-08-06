
import { SpektraLogo } from '@/components/spektra-logo';
import * as React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div 
      className="flex min-h-screen items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://spektrum-iog4.org/_assets/media/f0b9a89334c5fef85c67e09884b8d4e0.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="w-full max-w-md space-y-8 bg-card/80 backdrop-blur-sm p-6 rounded-lg">
        <div className="flex justify-center">
            <div className="flex items-center gap-3" >
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
        </div>
        {children}
      </div>
    </div>
  );
}
