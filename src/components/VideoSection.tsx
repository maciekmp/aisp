import { Expand, Minimize2 } from 'lucide-react'

interface VideoSectionProps {
  title: string
  src: string
  subtitle?: string
  filter?: string
  onExpand?: () => void
  isExpanded?: boolean
}

export function VideoSection({ title, src, subtitle, filter, onExpand, isExpanded }: VideoSectionProps) {
  return (
    <div className="flex-1 flex flex-col border-b border-gray-200 overflow-hidden relative">
      <div className="flex-1 flex items-center justify-center bg-black relative">
        <video
          src={src}
          autoPlay
          loop
          muted
          className="w-full h-full object-contain"
          style={filter ? { filter } : undefined}
        />
        <div className="absolute top-0 left-0 right-0 px-3 py-1.5 z-10">
          <h3 className="text-xs font-semibold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">{title}</h3>
          {subtitle ? (
            <p className="text-[10px] text-white/80 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] mt-0.5">{subtitle}</p>
          ) : null}
        </div>
        {onExpand && (
          <button
            onClick={onExpand}
            className="absolute top-2 right-2 z-20 bg-black/30 hover:bg-black/50 rounded p-1.5 transition-colors backdrop-blur-sm"
            title={isExpanded ? "Collapse video" : "Expand video"}
            aria-label={isExpanded ? "Collapse video" : "Expand video to center"}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-white" />
            ) : (
              <Expand className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>
    </div>
  )
}

