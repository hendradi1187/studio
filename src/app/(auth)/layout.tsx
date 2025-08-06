
import { SpektraLogo } from '@/components/spektra-logo';
import * as React from 'react';
import Image from 'next/image';

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
                <Image
                    src="https://spektrum-iog4.org/_assets/media/62b39362de15226ee51d31d89378ded2.png"
                    alt="Spektra Logo"
                    width={32}
                    height={32}
                    className="flex-shrink-0"
                />
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
