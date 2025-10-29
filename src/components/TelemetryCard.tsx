import { type ReactElement } from 'react'

interface TelemetryCardProps {
  icon: ReactElement
  label: string
  value: string
  valueColor?: string
}

export function TelemetryCard({ icon, label, value, valueColor = 'text-gray-900' }: TelemetryCardProps) {
  return (
    <div className="bg-gray-50 p-1 rounded flex flex-col min-w-0">
      <div className="flex items-center gap-1 justify-center mb-0.5 min-w-0">
        {icon}
        <div className="text-[9px] text-gray-500 truncate">{label}</div>
      </div>
      <div className={`text-xs font-semibold ${valueColor} text-center`}>{value}</div>
    </div>
  )
}

