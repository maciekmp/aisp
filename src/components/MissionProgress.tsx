import { useMemo } from 'react'

interface MissionProgressProps {
  /** Progress value between 0 and 1 */
  progress: number
  /** Array of stage labels (e.g., ['Start', 'Waypoint 1', 'Waypoint 2', 'Waypoint 3', 'Docking']) */
  stages: string[]
  /** Optional className for the container */
  className?: string
}

/**
 * Mission progress visualization component
 * Displays progress through mission stages with circles and connecting lines
 * Supports partial progress within segments
 */
export function MissionProgress({ progress, stages, className = '' }: MissionProgressProps) {
  const numSegments = stages.length - 1

  // Calculate which segment we're in and how much of it is complete
  const segmentProgress = useMemo(() => {
    const currentSegmentIndex = Math.floor(progress * numSegments)
    const progressInSegment = (progress * numSegments) % 1
    
    // Handle edge case where progress is exactly 1.0
    const finalSegmentIndex = progress >= 1 ? numSegments - 1 : currentSegmentIndex
    const finalProgressInSegment = progress >= 1 ? 1 : progressInSegment

    return {
      completedSegments: Math.min(finalSegmentIndex, numSegments - 1),
      currentSegmentIndex: finalSegmentIndex,
      progressInCurrentSegment: finalProgressInSegment
    }
  }, [progress, numSegments])

  const getSegmentStatus = (index: number) => {
    if (index < segmentProgress.completedSegments) {
      return { status: 'completed' as const, fill: 1 }
    } else if (index === segmentProgress.currentSegmentIndex) {
      return { status: 'current' as const, fill: segmentProgress.progressInCurrentSegment }
    } else {
      return { status: 'pending' as const, fill: 0 }
    }
  }

  const getStageStatus = (index: number) => {
    const segmentBefore = index - 1
    if (index === 0) {
      return 'completed'
    } else if (segmentBefore < segmentProgress.completedSegments) {
      return 'completed'
    } else if (segmentBefore === segmentProgress.currentSegmentIndex) {
      return 'current'
    } else {
      return 'pending'
    }
  }

  const renderCircle = (status: 'completed' | 'current' | 'pending') => {
    if (status === 'completed') {
      return (
        <div className="w-3 h-3 rounded-full bg-green-500 border border-white shadow-sm flex items-center justify-center">
          <div className="w-1 h-1 rounded-full bg-white"></div>
        </div>
      )
    }
    if (status === 'current') {
      return (
        <div className="w-3.5 h-3.5 rounded-full bg-blue-500 border border-white shadow-md flex items-center justify-center relative">
          <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
          <div className="absolute -inset-0.5 rounded-full bg-blue-500 animate-pulse opacity-50 -z-10"></div>
        </div>
      )
    }
    return <div className="w-3 h-3 rounded-full bg-gray-200 border border-white shadow-sm"></div>
  }

  const getLabelStyle = (isFirst: boolean, isLast: boolean) => {
    if (isFirst) return { left: 0, transform: 'translateX(0)', textAlign: 'left' as const }
    if (isLast) return { right: 0, transform: 'translateX(0)', textAlign: 'right' as const }
    return { left: '50%', transform: 'translateX(-50%)', textAlign: 'center' as const }
  }

  const getLabelColor = (status: 'completed' | 'current' | 'pending') => {
    if (status === 'completed') return 'text-gray-600'
    if (status === 'current') return 'font-semibold text-blue-600'
    return 'text-gray-400'
  }

  return (
    <div className={className}>
      {/* Circles and lines */}
      <div className="flex items-center">
        {stages.map((_, index) => {
          const stageStatus = getStageStatus(index)
          const segmentStatus = index < stages.length - 1 ? getSegmentStatus(index) : null
          
          return (
            <div key={index} className="contents">
              <div className="flex-shrink-0 relative z-10">{renderCircle(stageStatus)}</div>
              {segmentStatus && (
                <div className="flex-1 h-0.5 relative mx-0.5">
                  <div className="absolute inset-0 bg-gray-200"></div>
                  {segmentStatus.status !== 'pending' && (
                    <div 
                      className="absolute inset-y-0 left-0 bg-green-500"
                      style={{ width: segmentStatus.status === 'current' ? `${segmentStatus.fill * 100}%` : '100%' }}
                    ></div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex">
        {stages.map((stage, index) => {
          const stageStatus = getStageStatus(index)
          const isFirst = index === 0
          const isLast = index === stages.length - 1
          const labelStyle = getLabelStyle(isFirst, isLast)
          
          return (
            <div key={index} className="contents">
              <div className="flex-shrink-0 relative" style={{ width: stageStatus === 'current' ? '14px' : '12px' }}>
                <div 
                  className={`text-[8px] ${getLabelColor(stageStatus)} absolute whitespace-nowrap`}
                  style={labelStyle}
                >
                  {stage}
                </div>
              </div>
              {!isLast && <div className="flex-1 mx-0.5"></div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

