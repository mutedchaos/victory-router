import { useEffect, useRef, useState } from 'react'

export function useCurrentURL() {
  const [url, setURL] = useState(document.location.href)
  const prev = useRef(url)

  useEffect(() => {
    const observer = new MutationObserver(function () {
      if (location.href !== prev.current) {
        prev.current = location.href
        setURL(location.href)
      }
    })
    const config = { subtree: true, childList: true }
    observer.observe(document, config)

    return () => {
      observer.disconnect
    }
  }, [])

  return url
}
