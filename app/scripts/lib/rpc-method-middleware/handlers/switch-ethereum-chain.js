import {
  CHAIN_ID_TO_RPC_URL_MAP,
  CHAIN_ID_TO_SYMBOL_MAP,
  CHAIN_ID_TO_TYPE_MAP,
  NETWORK_TO_NAME_MAP
} from '@shared/constant/network'
import { isPrefixedFormattedHexString, isSafeChainId } from '@shared/util/network.util'
import { ethErrors } from 'eth-rpc-errors'
import { omit } from 'lodash'

const { MESSAGE_TYPE } = require('@shared/constant/app')

/**
 * Wrapper for 'wallet_switchEthereumChain' that open switch network on UI
 */
const switchEthereumChain = {
  methodNames: [MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN],
  implementation: switchEthereumChainHandler
}
export default switchEthereumChain

function findExistingNetwork(chainId, findCustomRpcBy) {
  if (chainId in CHAIN_ID_TO_TYPE_MAP) {
    return {
      chainId,
      currency: CHAIN_ID_TO_SYMBOL_MAP[chainId],
      name: NETWORK_TO_NAME_MAP[chainId],
      rpcUrl: CHAIN_ID_TO_RPC_URL_MAP[chainId]
    }
  }

  //   return findCustomRpcBy({ chainId })
}

async function switchEthereumChainHandler(
  req,
  res,
  _next,
  end,
  { getNetwork, requestUserApproval, updateNetworkProvider }
) {
  if (!req.params?.[0] || typeof req.params[0] !== 'object') {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected single, object parameter. Received:\n${JSON.stringify(req.params)}`
      })
    )
  }

  const { origin } = req

  const { chainId } = req.params[0]

  const otherKeys = Object.keys(omit(req.params[0], ['chainId']))

  if (otherKeys.length > 0) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Received unexpected keys on object parameter. Unsupported keys:\n${otherKeys}`
      })
    )
  }

  const _chainId = typeof chainId === 'string' && chainId.toLowerCase()

  if (!isPrefixedFormattedHexString(_chainId)) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Expected 0x-prefixed, unpadded, non-zero hexadecimal string 'chainId'. Received:\n${chainId}`
      })
    )
  }

  if (!isSafeChainId(parseInt(_chainId, 16))) {
    return end(
      ethErrors.rpc.invalidParams({
        message: `Invalid chain ID "${_chainId}": numerical value greater than max safe value. Received:\n${chainId}`
      })
    )
  }

  const requestData = findExistingNetwork(_chainId)
  if (requestData) {
    const currentChainId = getNetwork().chainId
    if (currentChainId === _chainId) {
      res.result = null
      return end()
    }
    try {
      const approvedRequestData = await requestUserApproval({
        origin,
        id: req.id.toString(),
        type: MESSAGE_TYPE.SWITCH_ETHEREUM_CHAIN,
        requestData
      })
      //   if (chainId in CHAIN_ID_TO_TYPE_MAP) {
      //     setProviderType(approvedRequestData.type)
      //   } else {
      //   }
      await updateNetworkProvider(approvedRequestData)
      res.result = null
    } catch (error) {
      return end(error)
    }
    return end()
  }
  return end(
    ethErrors.provider.custom({
      code: 4902, // To-be-standardized "unrecognized chain ID" error
      message: `Unrecognized chain ID "${chainId}". Try adding the chain using ${MESSAGE_TYPE.ADD_ETHEREUM_CHAIN} first.`
    })
  )
}
