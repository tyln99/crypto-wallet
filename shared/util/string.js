import { isNumeric } from './number'
import { isAddress } from 'web3-utils'
import { startCase, toLower } from 'lodash'
import { log, logErr, logWarn } from '@shared/util/logger'

export const stringToASCII = (string) => {
  let charCodeArr = []
  for (let i = 0; i < string.length; i++) {
    let code = string.charCodeAt(i)
    charCodeArr.push(code)
  }
  return charCodeArr
}

export const ASCIIToString = (charCodeArr) => {
  return String.fromCharCode(...charCodeArr)
}

export const formatAddress = (address) => {
  if (isAddress(address)) {
    return `${address.substring(0, 5)}...${address.substring(address.length - 5, address.length)}`
  } else {
    // account name
    return address.length > 20 ? `${address.substring(0, 17)}...` : address
  }
}

export const formatBalance = (balance, currency) => {
  // log('On format balance: ', balance, currency)
  if (!isNumeric(balance)) {
    log(`[formatBalance] balance ${balance} is not valid`)
    return '0 ' + currency
  }
  const balanceAsString = String(balance)
  if (balanceAsString === '0' || balanceAsString === '') {
    return balanceAsString + ' ' + currency
  } else if (parseInt(balance) > 999999) {
    return balanceAsString.substring(0, 6) + '... ' + currency
  } else {
    return balanceAsString.substring(0, 6) + ' ' + currency
  }
}

export const stringCapitalize = (string) => {
  return startCase(toLower(string))
}

export const compare = (string1, string2) => {
  return string1.toLowerCase() === string2.toLowerCase()
}

export const toLowerCase = (string) => {
  try {
    return string.toLowerCase()
  } catch (error) {
    logWarn(error)
  }
}
