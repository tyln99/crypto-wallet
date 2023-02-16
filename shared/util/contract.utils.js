import Web3 from 'web3'

/**
 * @deprecated
 */
export function generateGetBalanceData({ address }) {
  try {
    const web3 = new Web3()
    const encoded = web3.eth.abi.encodeFunctionCall(
      {
        name: 'balanceOf',
        type: 'function',
        inputs: [
          {
            name: '_owner',
            type: 'address'
          }
        ]
      },
      [address]
    )
    return encoded
  } catch (error) {
    throw error
  }
}

export function decodeData() {}
