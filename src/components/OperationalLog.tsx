import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send } from 'lucide-react'

export type LogEntry = {
  id: string
  timestamp: number
  message: string
}

interface OperationalLogProps {
  missionId?: string
  onLogAdded?: (entry: LogEntry) => void
}

export function OperationalLog({ missionId = 'current', onLogAdded }: OperationalLogProps) {
  const [comment, setComment] = useState('')
  const [logs, setLogs] = useState<LogEntry[]>([])

  // Load logs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`operational_logs_${missionId}`)
    if (stored) {
      try {
        setLogs(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored logs:', e)
      }
    }
  }, [missionId])

  // Save logs to localStorage whenever they change
  useEffect(() => {
    if (logs.length > 0) {
      localStorage.setItem(`operational_logs_${missionId}`, JSON.stringify(logs))
    }
  }, [logs, missionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message: comment.trim()
    }

    const updatedLogs = [newEntry, ...logs].slice(0, 50) // Keep last 50 entries
    setLogs(updatedLogs)
    setComment('')
    onLogAdded?.(newEntry)
  }

  return (
    <div className="bg-gray-50 rounded border border-gray-200">
      <div className="p-1.5">
        <div className="flex items-center gap-1.5 mb-1.5">
          <MessageSquare className="w-3 h-3 text-gray-600" />
          <div className="text-[9px] text-gray-600 uppercase tracking-wide font-semibold">
            Operational Log
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add comment..."
            className="flex-1 text-[10px] px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={200}
          />
          <Button
            type="submit"
            size="sm"
            className="h-7 px-2 text-[10px]"
            disabled={!comment.trim()}
          >
            <Send className="w-3 h-3" />
          </Button>
        </form>
      </div>
    </div>
  )
}

