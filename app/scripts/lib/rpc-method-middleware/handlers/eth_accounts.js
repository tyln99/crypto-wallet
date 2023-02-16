import { getAddressesFromPermission } from '@shared/util/util'
import { ethErrors } from 'eth-rpc-errors'
import { isEmpty } from 'lodash'

const { MESSAGE_TYPE } = require('@shared/constant/app')

/**
 * A wrapper for `eth_accounts` that returns an empty array when permission is denied.
 */
const ethAccounts = {
  methodNames: [MESSAGE_TYPE.EH_ACCOUNTS],
  implementation: ethAccountsHandler
}
export default ethAccounts

async function ethAccountsHandler(req, res, _next, end, { getPermission, getProviderState }) {
  if (!getPermission) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  if (!getProviderState) {
    return end(new Error('opts.getProviderState is required'))
  }

  const { origin } = req
  const pm = await getPermission({ origin })
  let rs
  if (!isEmpty(pm)) {
    const value = getAddressesFromPermission(pm)

    const selectedAddress = await getProviderState().selectedAddress
    if (value.includes(selectedAddress)) {
      rs = selectedAddress
    } else {
      rs = value[0] || null
    }
  }
  res.result = rs ? [rs] : []
  return end()
}
