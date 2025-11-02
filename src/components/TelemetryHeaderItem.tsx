import { type ReactElement } from 'react'

interface TelemetryHeaderItemProps {
  icon: ReactElement
  value: string
  valueClassName?: string
}

export function TelemetryHeaderItem({ icon, value, valueClassName }: TelemetryHeaderItemProps) {
  return (
    <div className="flex items-center gap-1">
      {icon}
      <span className={`text-xs font-semibold text-gray-900 ${valueClassName || ''}`}>{value}</span>
    </div>
  )
}

