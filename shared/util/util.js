import { forOwn } from 'lodash'

/**
 * Prefixes a hex string with '0x' or '-0x' and returns it. Idempotent.
 *
 * @param {string} str - The string to prefix.
 * @returns {string} The prefixed string.
 */
const addHexPrefix = (str) => {
  if (typeof str !== 'string' || str.match(/^-?0x/u)) {
    return str
  }

  if (str.match(/^-?0X/u)) {
    return str.replace('0X', '0x')
  }

  if (str.startsWith('-')) {
    return str.replace('-', '-0x')
  }

  return `0x${str}`
}

const isValidHttpUrl = (string) => {
  let url

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

const getAddressesFromPermission = (permission) => {
  const {
    permissions: {
      eth_accounts: {
        caveats: [{ value }]
      }
    }
  } = permission
  return value
}

const getPermissionsFromStore = (store) => {
  const permissions = {}
  forOwn(store, (value, key) => {
    permissions[key] = getAddressesFromPermission(value)
  })
  return permissions
}

export { addHexPrefix, isValidHttpUrl, getAddressesFromPermission, getPermissionsFromStore }
