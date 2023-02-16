import utils from 'web3-utils'
import { log, logErr } from './logger'
import { isNumeric } from './number'

export const fromWei = (value, unit) => {
  if (!isNumeric(value)) {
    log(`[fromWei] Invalid number ${value}`)
    return 0
  }
  // unit is 'ether' by default
  try {
    return utils.fromWei(String(value.toString()), unit)
  } catch (error) {
    logErr({ error, data: { value, unit } })
  }
}

export const toWei = (value, unit) => {
  if (!isNumeric(value)) {
    log(`[toWei] Invalid number ${value}`)
    return 0
  }
  // unit is 'ether' by default if undefined
  try {
    return utils.toWei(String(value.toString()), unit)
  } catch (error) {
    logErr({ error, data: { value, unit } })
  }
}
