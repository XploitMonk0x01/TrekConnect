import Link from 'next/link'
import { MountainSnow } from 'lucide-react'
import { cn } from '@/lib/utils'

export function SiteLogo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        'flex items-center gap-2.5 text-lg font-bold font-headline group',
        className
      )}
    >
      <div className="relative">
        <MountainSnow className="h-8 w-8 text-primary transition-transform duration-300 group-hover:scale-110" />
        {/* Snow cap accent */}
        <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1.5 w-3 rounded-full bg-white/80 blur-[1px]" />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-foreground tracking-tight">
          Trek<span className="text-primary">Connect</span>
        </span>
        <span className="text-[10px] font-normal text-muted-foreground tracking-widest uppercase">
          Himalayan Adventures
        </span>
      </div>
    </Link>
  )
}
