import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { MessageSquare, Send } from 'lucide-react'
import type { LogEntry } from '@/types'
import { LOG_CONFIG } from '@/constants'
import { useLocalStorage } from '@/hooks/useLocalStorage'

/**
 * Props for OperationalLog component
 */
interface OperationalLogProps {
  /** Mission ID for scoped log storage (default: 'current') */
  missionId?: string
  /** Callback when a new log entry is added */
  onLogAdded?: (entry: LogEntry) => void
}

/**
 * Operational log component for mission notes and comments
 * Persists logs to localStorage with automatic debouncing
 * Maintains a maximum of 50 entries per mission
 */
export function OperationalLog({ missionId = 'current', onLogAdded }: OperationalLogProps) {
  const { t } = useTranslation()
  const [comment, setComment] = useState('')
  const [logs, setLogs] = useLocalStorage<LogEntry[]>(`operational_logs_${missionId}`, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim()) return

    const newEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      message: comment.trim()
    }

    const updatedLogs = [newEntry, ...logs].slice(0, LOG_CONFIG.MAX_LOG_ENTRIES)
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
            {t('operationalLog.title')}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-1">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={t('operationalLog.placeholder')}
            className="flex-1 text-[10px] px-2 py-1 border border-gray-300 rounded bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            maxLength={LOG_CONFIG.MAX_MESSAGE_LENGTH}
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

