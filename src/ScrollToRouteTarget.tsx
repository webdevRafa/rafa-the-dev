import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToRouteTarget() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))

      if (target) {
        target.scrollIntoView({ block: 'start' })
        return
      }
    }

    window.scrollTo({ top: 0, left: 0 })
  }, [pathname, hash])

  return null
}

export default ScrollToRouteTarget
