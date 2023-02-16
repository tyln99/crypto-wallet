import { SECOND } from '@shared/constant/time'
import { useEffect } from 'react'

const DEFAULT_DELAY = SECOND * 0.5

let counter = 0
export default function useInterval(
  callback,
  delay = DEFAULT_DELAY,
  timesLimit = Number.MAX_VALUE
) {
  // Set up the interval
  useEffect(() => {
    if (delay && callback) {
      let id = setInterval(() => {
        if (counter >= timesLimit) {
          return clearInterval(id)
        } else {
          counter++
          callback()
        }
      }, delay)

      return () => clearInterval(id)
    }
  }, [callback, delay])
}
