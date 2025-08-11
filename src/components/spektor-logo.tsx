
import * as React from 'react';
import Image from 'next/image';

export function SpektorLogo(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className="flex items-center gap-3" {...props}>
      <Image
        src="https://spektrum-iog4.org/_assets/media/62b39362de15226ee51d31d89378ded2.png"
        alt="Spektor Logo"
        width={32}
        height={32}
        className="flex-shrink-0"
      />
      <div>
        <span className="font-semibold text-white tracking-wider">SPEKTOR</span>
        <p className="text-xs text-slate-400" style={{whiteSpace: 'nowrap'}}>
            Spektrum Data Space Connector
        </p>
      </div>
    </div>
  );
}
