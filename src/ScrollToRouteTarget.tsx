import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToRouteTarget() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (hash) {
      const frame = window.requestAnimationFrame(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView()
      })
      return () => window.cancelAnimationFrame(frame)
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])

  return null
}

export default ScrollToRouteTarget
