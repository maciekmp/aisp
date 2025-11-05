import { useEffect, useState, useRef } from 'react'

export function AlertOverlay() {
  const [isVisible, setIsVisible] = useState(false)
  const isVisibleRef = useRef(isVisible)

  useEffect(() => {
    isVisibleRef.current = isVisible
  }, [isVisible])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'a' || e.key === 'A') {
        setIsVisible(true)
      }
    }

    const handleClick = () => {
      if (isVisibleRef.current) {
        setIsVisible(false)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    window.addEventListener('click', handleClick, true)
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
      window.removeEventListener('click', handleClick, true)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div 
      className="fixed inset-0 z-[9999] pointer-events-none"
      style={{ 
        border: '8px solid red',
        boxSizing: 'border-box',
        animation: 'pulseBorder 1s ease-in-out infinite'
      }}
    />
  )
}

