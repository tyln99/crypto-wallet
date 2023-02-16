import { MESSAGE_TYPE } from '@shared/constant/app'
import { getAddressesFromPermission } from '@shared/util/util'
import { ethErrors } from 'eth-rpc-errors'
import { isEmpty } from 'lodash'
import { isAddress } from 'web3-utils'

/**
 * Wrapper for 'eth_sign' that open confirm signature popup
 */
const signMessage = {
  methodNames: [MESSAGE_TYPE.ETH_SIGN],
  implementation: signMessageHandler
}
export default signMessage

async function signMessageHandler(
  req,
  res,
  _next,
  end,
  { requestUserApproval, signMessage, getPermission }
) {
  if (!signMessage) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  if (!getPermission) {
    return end(new Error('opts.getPermission is required'))
  }

  if (!req.params || !(req.params?.length === 2)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected 2 value, array parameter. Received:\n${JSON.stringify(req.params)}`
      })
    )
  }

  let [address, message] = req.params

  if (!isAddress(address)) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid address ${address}` }))
  }

  const { origin } = req
  const pm = await getPermission({ origin })

  if (isEmpty(pm)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: 'Invalid parameters: must provide an Ethereum address.'
      })
    )
  }

  const addresses = getAddressesFromPermission(pm)
  if (!addresses.includes(address)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: 'Invalid parameters: must provide an Ethereum address.'
      })
    )
  }

  if (message.length === 66 || message.length === 67) {
    try {
      const { account } = await requestUserApproval({
        origin,
        id: req.id.toString(),
        type: MESSAGE_TYPE.ETH_SIGN,
        requestData: { address, message }
      })
      res.result = signMessage(message, account.privateKey).signature
    } catch (error) {
      return end(error)
    }
    return end()
  } else {
    return end(ethErrors.rpc.invalidParams('eth_sign requires 32 byte message hash'))
  }
}
