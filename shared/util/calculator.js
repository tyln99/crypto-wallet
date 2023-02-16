import { UNITS } from '@shared/constant/app'
import { round } from 'lodash'
import { fromWei } from './converter'
import { logErr } from './logger'

export const calculateTransactionFee = (gasPrice, gasLimit, amount) => {
  try {
    if (!gasLimit) return 0
    const fee =
      parseFloat(fromWei((gasPrice * gasLimit).toFixed(0), UNITS.GWEI)) + parseFloat(amount)
    return round(fee, 5)
  } catch (error) {
    logErr({ error, data: { gasPrice, gasLimit, amount } })
  }
}
