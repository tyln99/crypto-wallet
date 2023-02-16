import { log, logErr } from './logger'

export const miliToDate = (mili) => {
  try {
    const today = new Date(mili)
    if (!isValidDate(today)) {
      throw new Error(`Invalid time ${mili}`)
    }
    const dd = String(today.getDate()).padStart(2, 0)
    const mm = String(today.getMonth() + 1).padStart(2, 0)
    const yyyy = today.getFullYear()
    return `${dd}/${mm}/${yyyy}`
  } catch (error) {
    log(error)
    return ''
  }
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d)
}
