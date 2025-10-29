import { type ReactElement } from 'react'

interface TelemetryHeaderItemProps {
  icon: ReactElement
  value: string
}

export function TelemetryHeaderItem({ icon, value }: TelemetryHeaderItemProps) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className="text-xs font-semibold text-gray-900">{value}</span>
    </div>
  )
}

