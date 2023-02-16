import { MESSAGE_TYPE } from '@shared/constant/app'
import { getAddressesFromPermission } from '@shared/util/util'
import { ethErrors } from 'eth-rpc-errors'
import { isEmpty } from 'lodash'
import { isAddress } from 'web3-utils'

/**
 * Wrapper for 'eth_sendTransaction' that check origin permission
 * if this origin has permission, open confirm transaction popup
 * else return error
 */
const sendTransaction = {
  methodNames: [MESSAGE_TYPE.WALLET_SEND_TRANSACTION],
  implementation: sendTransactionHandler
}

export default sendTransaction

async function sendTransactionHandler(
  req,
  res,
  _next,
  end,
  { requestUserApproval, getPermission, sendTransaction }
) {
  if (!sendTransaction) {
    return end(ethErrors.rpc.methodNotSupported())
  }

  if (!getPermission) {
    return end(new Error('opts.getPermission is required'))
  }

  let { from, to, value, gas, gasPrice, data } = req.params[0]

  if (!isAddress(from)) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid address ${from}` }))
  }

  if (!isAddress(to)) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid address ${to}` }))
  }

  if (value === null || typeof value === 'undefined' || Number(value) < 0) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid amount value ${value}` }))
  }

  if (gas === null || typeof gas === 'undefined' || Number(gas) < 0) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid gas value ${gas}` }))
  }

  if (gasPrice === null || typeof gasPrice === 'undefined' || Number(gasPrice) < 0) {
    return end(ethErrors.rpc.invalidParams({ message: `Invalid gasPrice value ${gasPrice}` }))
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
  if (!addresses.includes(from)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: 'Invalid parameters: must provide an Ethereum address.'
      })
    )
  }

  try {
    const { txDetails, estimatedGas, newGasPrice, account } = await requestUserApproval({
      origin: req.origin,
      id: req.id.toString(),
      type: MESSAGE_TYPE.WALLET_SEND_TRANSACTION,
      requestData: req.params[0]
    })

    res.result = await sendTransaction(
      {
        from: account, // put account object because transaction need private key
        to,
        gas: estimatedGas || gas,
        gasPrice: newGasPrice || gasPrice,
        value,
        data,
        txDetails
      },
      req.origin
    )
  } catch (error) {
    return end(error)
  }
  return end()
}
