import { ethErrors } from 'eth-rpc-errors'
import { isEmpty } from 'lodash'

const { MESSAGE_TYPE } = require('@shared/constant/app')

/**
 * A wrapper for `wallet_getPermissions` that returns an empty array when DApp doesn't have permission.
 */
const getPermissions = {
  methodNames: [MESSAGE_TYPE.WALLET_GET_PERMISSIONS],
  implementation: getPermissionsHandler
}

export default getPermissions

async function getPermissionsHandler(req, res, _next, end, { getPermission }) {
  if (!getPermission) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  let rs
  const { origin } = req
  const pms = await getPermission({ origin })
  if (!isEmpty(pms)) {
    rs = pms.permissions.eth_accounts
  }
  res.result = rs ? [rs] : []
  return end()
}
