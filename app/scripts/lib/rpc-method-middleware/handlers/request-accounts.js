import { MESSAGE_TYPE } from '@shared/constant/app'
import { getAddressesFromPermission } from '@shared/util/util'
import { ethErrors } from 'eth-rpc-errors'
import { isEmpty } from 'lodash'

/**
 * This method attempts to retrieve the Ethereum accounts available to the
 * requester, or initiate a request for account access if none are currently
 * available. It is essentially a wrapper of wallet_requestPermissions that
 * only errors if the user rejects the request. We maintain the method for
 * backwards compatibility reasons.
 */
const requestAccounts = {
  methodNames: [MESSAGE_TYPE.REQUEST_ACCOUNTS],
  implementation: requestAccountsHandler
}
export default requestAccounts

async function requestAccountsHandler(
  req,
  res,
  _next,
  end,
  { requestUserApproval, getPermission, requestPermissions, getProviderState }
) {
  if (!getPermission) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  if (!requestPermissions) {
    return end(new Error('opts.requestPermissions is required'))
  }

  if (!requestUserApproval) {
    return end(new Error('opts.requestUserApproval is required'))
  }

  if (!getProviderState) {
    return end(new Error('opts.getProviderState is required'))
  }

  const { origin } = req

  const pm = await getPermission({ origin })
  let rs
  if (!isEmpty(pm)) {
    // domain already has permission
    const value = getAddressesFromPermission(pm)

    const selectedAddress = (await getProviderState()).selectedAddress
    if (value.includes(selectedAddress)) {
      rs = selectedAddress
    } else {
      rs = value[0] || null
    }
  } else {
    // domain does not has permission
    try {
      const accounts = await requestUserApproval({
        origin,
        id: req.id.toString(),
        type: MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS
      })

      const newPm = await requestPermissions({ origin, accounts })
      const value = getAddressesFromPermission(newPm[origin])

      const selectedAddress = (await getProviderState()).selectedAddress
      if (value.includes(selectedAddress)) {
        rs = selectedAddress
      } else {
        rs = value[0] || null
      }
    } catch (error) {
      return end(error)
    }
  }
  res.result = rs ? [rs] : []
  return end()
}
