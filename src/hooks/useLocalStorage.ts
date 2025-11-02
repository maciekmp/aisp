import { useState, useEffect, useCallback, useRef } from 'react'
import { LOG_CONFIG } from '@/constants'

/**
 * Custom hook for managing localStorage with automatic serialization/deserialization
 * @param key - The localStorage key
 * @param initialValue - Initial value if key doesn't exist
 * @param options - Optional configuration
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    /** Debounce delay for writes (ms). Default: 300ms */
    debounceMs?: number
    /** Custom serializer (defaults to JSON.stringify) */
    serializer?: (value: T) => string
    /** Custom deserializer (defaults to JSON.parse) */
    deserializer?: (value: string) => T
  }
): [T, (value: T | ((prev: T) => T)) => void] {
  const debounceMs = options?.debounceMs ?? LOG_CONFIG.STORAGE_DEBOUNCE_MS
  const serializer = options?.serializer ?? JSON.stringify
  const deserializer = options?.deserializer ?? JSON.parse

  // Get initial value from localStorage or use provided initial
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? (deserializer(item) as T) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // Value ref to track latest value for debounced write
  const valueRef = useRef<T>(storedValue)

  // Update ref when storedValue changes
  useEffect(() => {
    valueRef.current = storedValue
  }, [storedValue])

  // Debounced write function
  const writeToStorage = useCallback(
    (value: T) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      debounceTimerRef.current = setTimeout(() => {
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, serializer(value))
          }
        } catch (error) {
          console.error(`Error setting localStorage key "${key}":`, error)
        }
      }, debounceMs)
    },
    [key, serializer, debounceMs]
  )

  // Set value function
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        writeToStorage(valueToStore)
      } catch (error) {
        console.error(`Error setting value for localStorage key "${key}":`, error)
      }
    },
    [key, storedValue, writeToStorage]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        // Write final value immediately on unmount
        try {
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, serializer(valueRef.current))
          }
        } catch (error) {
          console.error(`Error writing final value for localStorage key "${key}":`, error)
        }
      }
    }
  }, [key, serializer])

  return [storedValue, setValue]
}

