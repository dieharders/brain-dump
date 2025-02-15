import { useEffect, useState } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T) => void] => {
  const [storedValue, setStoredValue] = useState(initialValue)

  useEffect(() => {
    // Retrieve from localStorage
    // Check window exists, getting error server side
    if (!window) return
    const item = window.localStorage.getItem(key)
    if (item) {
      setStoredValue(JSON.parse(item))
    }
  }, [key])

  const setValue = (value: T) => {
    // Save state
    setStoredValue(value)
    // Save to localStorage
    // Check window exists, getting error server side
    window && window.localStorage.setItem(key, JSON.stringify(value))
  }
  return [storedValue, setValue]
}
