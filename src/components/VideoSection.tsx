import { useTranslation } from 'react-i18next'
import { Expand, Minimize2, Camera } from 'lucide-react'

/**
 * Props for VideoSection component
 */
interface VideoSectionProps {
  /** Video section title */
  title: string
  /** Video source URL */
  src: string
  /** Optional subtitle text */
  subtitle?: string
  /** CSS filter to apply to video (e.g., for thermal camera effect) */
  filter?: string
  /** Callback when expand button is clicked */
  onExpand?: () => void
  /** Whether the video is currently in expanded/fullscreen mode */
  isExpanded?: boolean
  /** Callback when photo capture button is clicked */
  onTakePhoto?: () => void
  /** Callback when save clip button is clicked */
  onSaveClip?: () => void
}

/**
 * Video display component with controls for expanding, photo capture, and clip saving
 * Supports both RGB and thermal camera feeds with optional CSS filters
 */
export function VideoSection({ title, src, subtitle, filter, onExpand, isExpanded, onTakePhoto, onSaveClip }: VideoSectionProps) {
  const { t } = useTranslation()
  return (
    <div className={`${isExpanded ? 'flex-1 min-h-0' : ''} border-b border-gray-200 bg-black relative overflow-hidden aspect-video w-full`}>
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
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-2">
        {onExpand && (
          <button
            onClick={onExpand}
            className="w-12 h-8 bg-black/30 hover:bg-black/50 rounded flex items-center justify-center transition-colors backdrop-blur-sm"
            title={isExpanded ? t('dashboard.collapseVideo') : t('dashboard.expandVideo')}
            aria-label={isExpanded ? t('dashboard.collapseVideo') : t('dashboard.expandVideo')}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 text-white" />
            ) : (
              <Expand className="w-4 h-4 text-white" />
            )}
          </button>
        )}
        {onTakePhoto && (
          <button
            onClick={onTakePhoto}
            className="w-12 h-8 bg-black/30 hover:bg-black/50 rounded flex items-center justify-center transition-colors backdrop-blur-sm"
            title={t('dashboard.takePhoto')}
            aria-label={t('dashboard.takePhoto')}
          >
            <Camera className="w-4 h-4 text-white" />
          </button>
        )}
        {onSaveClip && (
          <button
            onClick={onSaveClip}
            className="w-12 h-8 bg-black/30 hover:bg-black/50 rounded flex items-center justify-center transition-colors backdrop-blur-sm"
            title={t('dashboard.saveClip')}
            aria-label={t('dashboard.saveClip')}
          >
            <span className="text-xs text-white font-medium">30s</span>
          </button>
        )}
      </div>
    </div>
  )
}

