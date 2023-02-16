import { MESSAGE_TYPE } from '@shared/constant/app'
import { ethErrors } from 'eth-rpc-errors'

/**
 * Wrapper for wallet_requestPermissions that trigger open popup
 * for user confirm connection
 */
const requestPermissions = {
  methodNames: [MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS],
  implementation: requestPermissionsHandler
}
export default requestPermissions

async function requestPermissionsHandler(
  req,
  res,
  _next,
  end,
  { requestUserApproval, requestPermissions }
) {
  if (!requestPermissions) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  const { origin } = req

  try {
    const accounts = await requestUserApproval({
      origin,
      id: req.id.toString(),
      type: MESSAGE_TYPE.WALLET_REQUEST_PERMISSIONS
    })

    const pm = await requestPermissions({ origin, accounts })
    res.result = [pm[origin].permissions.eth_accounts]
  } catch (error) {
    return end(error)
  }
  return end()
}
