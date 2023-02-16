import Web3 from 'web3'
import { toWei } from './converter'
import { log } from './logger'
import { toHex } from 'web3-utils'

export function generateERC20TransferData(to, value) {
  try {
    return generateFunctionData({
      abiItem: {
        name: 'transfer',
        type: 'function',
        inputs: [
          {
            name: '_to',
            type: 'address'
          },
          {
            name: '_value',
            type: 'uint256'
          }
        ]
      },
      params: [to, `${toHex(toWei(value))}`]
    })
  } catch (error) {
    throw error
  }
}

export function generateFunctionData({ abiItem, params }) {
  try {
    const web3 = new Web3()
    const encodedFunc = web3.eth.abi.encodeFunctionCall(abiItem, params)
    return encodedFunc
  } catch (error) {
    log(error)
    throw error
  }
}
