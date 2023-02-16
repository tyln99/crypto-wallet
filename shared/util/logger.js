import { ENVIRONMENT } from '../constant/app'
import * as Sentry from '@sentry/react'

const nonce = () => {}

const log =
  process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? nonce : console.log.bind(window.console)

const logWarn =
  process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? nonce : console.warn.bind(window.console)

// const logErr =
//   process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? nonce : console.error.bind(window.console)

const logCount =
  process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? nonce : console.count.bind(window.console)

const logTable =
  process.env.NODE_ENV === ENVIRONMENT.PRODUCTION ? nonce : console.table.bind(window.console)

const logErr = ({ error, data }) => {
  if (error) {
    process.env.NODE_ENV !== ENVIRONMENT.PRODUCTION
      ? console.error(error)
      : captureError(error, data)
  }
}

const captureError = (error, data) => {
  Sentry.captureException(error, {
    contexts: {
      data: data
    }
  })
}

export { log, logWarn, logErr, logCount, logTable }
