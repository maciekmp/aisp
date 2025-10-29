import { type ReactElement } from 'react'

interface NavButtonProps {
  id: string
  label: string
  icon: ReactElement
  isActive: boolean
  onClick: () => void
}

export function NavButton({ id, label, icon, isActive, onClick }: NavButtonProps) {
  return (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`w-full flex items-center justify-center py-3 transition-colors ${
          isActive
            ? 'bg-gray-800 border-r-2 border-blue-500'
            : 'hover:bg-gray-800'
        }`}
      >
        {icon}
      </button>
      <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-800 text-white text-sm rounded whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity pointer-events-none z-50 shadow-lg">
        {label}
        <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[6px] border-r-gray-800"></div>
      </div>
    </div>
  )
}

