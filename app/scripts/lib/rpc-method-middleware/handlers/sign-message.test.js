import signMessage from './sign-message'
const { MOCK_USER_ADDR, MOCK_PRIVATEKEY } = require('../../../../../test/mocks/tx')

describe('signMessage', () => {
  const { implementation } = signMessage
  let mockEnd
  let mockReq
  let nonce
  let mockRes

  beforeEach(() => {
    mockEnd = (err) => {
      throw err
    }

    mockReq = { origin: 'https://google.com', id: 123, params: [MOCK_USER_ADDR, 'test message'] }
    nonce = () => null

    mockRes = {
      result: null
    }
  })

  it('should throw method not support', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: null,
        getPermission: nonce
      })
    ).rejects.toThrow('Method not supported.')
  })

  it('should throw opts.getPermission is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: nonce,
        getPermission: null
      })
    ).rejects.toThrow('opts.getPermission is required')
  })

  it('should throw params error', async () => {
    mockReq.params = []
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: nonce,
        getPermission: nonce
      })
    ).rejects.toThrow('Expected 2 value, array parameter. Received:\n[]')
  })

  it('should throw invalid address', async () => {
    mockReq.params = ['abcd', 'test message']
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: nonce,
        getPermission: nonce
      })
    ).rejects.toThrow('Invalid address abcd')
  })

  it('should throw must provide an Ethereum address', async () => {
    const mockGetPermission = () => new Promise((resolve, reject) => resolve({}))
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: nonce,
        getPermission: mockGetPermission
      })
    ).rejects.toThrow('Invalid parameters: must provide an Ethereum address.')
  })

  it('should throw eth_sign requires 32 byte message hash', async () => {
    const mockGetPermission = ({ origin }) => {
      if (origin !== 'https://google.com') {
        return Promise.resolve({})
      }
      return Promise.resolve({
        permissions: {
          eth_accounts: {
            caveats: [{ value: [MOCK_USER_ADDR] }]
          }
        }
      })
    }
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        signMessage: nonce,
        getPermission: mockGetPermission
      })
    ).rejects.toThrow('eth_sign requires 32 byte message hash')
  })

  it('should return signature', async () => {
    const mockGetPermission = ({ origin }) => {
      if (origin !== 'https://google.com') {
        return Promise.resolve({})
      }
      return Promise.resolve({
        permissions: {
          eth_accounts: {
            caveats: [{ value: [MOCK_USER_ADDR] }]
          }
        }
      })
    }
    mockReq.params = [
      MOCK_USER_ADDR,
      '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
    ]

    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: () =>
          new Promise((resolve, _) => {
            resolve({
              account: {
                address: MOCK_USER_ADDR,
                privateKey: MOCK_PRIVATEKEY
              }
            })
          }),
        signMessage: () => ({ signature: 'signature' }),
        getPermission: mockGetPermission
      })
    } catch (error) {
      console.error(error)
    }
    expect(mockRes.result).toBe('signature')
  })
})
