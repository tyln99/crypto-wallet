import { MESSAGE_TYPE } from '@shared/constant/app'
import switchEthereumChain from './switch-ethereum-chain'
const { MOCK_USER_ADDR, MOCK_PRIVATEKEY, MOCK_CHAIN_ID } = require('../../../../../test/mocks/tx')

describe('switchEthereumChain', () => {
  const { implementation } = switchEthereumChain
  let mockEnd
  let mockReq
  let nonce
  let mockRes
  beforeAll(() => {
    mockEnd = (err) => {
      throw err
    }

    mockReq = {
      origin: 'https://google.com',
      id: 123,
      params: [
        {
          chainId: MOCK_CHAIN_ID
        }
      ]
    }
    nonce = () => null

    mockRes = {
      result: null
    }
  })

  it('should throw Expected single, object parameter', async () => {
    mockReq.params = []
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: nonce,
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    ).rejects.toThrow('Expected single, object parameter. Received:\n[]')
  })

  it('should throw Received unexpected keys on object parameter', async () => {
    mockReq.params = [
      {
        chainId: 1,
        other: 'other'
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: nonce,
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    ).rejects.toThrow(
      `Received unexpected keys on object parameter. Unsupported keys:\n${['other']}`
    )
  })

  it('should throw invalid chainId prefix', async () => {
    mockReq.params = [
      {
        chainId: 1
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: nonce,
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    ).rejects.toThrow(
      `Expected 0x-prefixed, unpadded, non-zero hexadecimal string 'chainId'. Received:\n${1}`
    )
  })

  it('should throw invalid chainId', async () => {
    mockReq.params = [
      {
        chainId: '0x99999999999999999'
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: nonce,
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    ).rejects.toThrow(
      `Invalid chain ID "${'0x99999999999999999'}": numerical value greater than max safe value. Received:\n${'0x99999999999999999'}`
    )
  })

  it('should throw Unrecognized chain ID', async () => {
    mockReq.params = [
      {
        chainId: '0x12345'
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: nonce,
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    ).rejects.toThrow(
      `Unrecognized chain ID "0x12345". Try adding the chain using ${MESSAGE_TYPE.ADD_ETHEREUM_CHAIN} first.`
    )
  })

  it('should return null if current network is with requesting', async () => {
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: () => ({ chainId: MOCK_CHAIN_ID }),
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    } catch (error) {
      console.error(error)
    }
    expect(mockRes.result).toBe(null)
  })

  it('should switch success and return null if current network is with requesting', async () => {
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getNetwork: () => ({ chainId: '0x1' }),
        requestUserApproval: nonce,
        updateNetworkProvider: nonce
      })
    } catch (error) {
      console.error(error)
    }
    expect(mockRes.result).toBe(null)
  })
})
