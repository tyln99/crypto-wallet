import { ethErrors } from 'eth-rpc-errors'

const { MESSAGE_TYPE } = require('@shared/constant/app')

/**
 * This RPC method gets background state relevant to the provider.
 * The background sends RPC notifications on state changes, but the provider
 * first requests state on initialization.
 */
const getProviderState = {
  methodNames: [MESSAGE_TYPE.GET_PROVIDER_STATE],
  implementation: getProviderStateHandler
}
export default getProviderState

async function getProviderStateHandler(req, res, _next, end, { getProviderState }) {
  if (!getProviderState) {
    return end(ethErrors.rpc.methodNotSupported())
  }
  res.result = {
    ...(await getProviderState())
  }
  return end()
}
