import requestPermissions from './request-permissions'
const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')

describe('requestPermissions', () => {
  const { implementation } = requestPermissions
  let mockEnd
  let mockReq
  let nonce
  let mockRes
  beforeAll(() => {
    mockEnd = (err) => {
      throw err
    }

    mockReq = { origin: 'https://google.com', id: 123 }
    nonce = () => null

    mockRes = {
      result: null
    }
  })

  it('should throw method not supported when not specify requestPermissions function', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        requestPermissions: null
      })
    ).rejects.toThrow('Method not supported.')
  })

  it('should return list requested accounts', async () => {
    const mockCaveats = {
      caveats: [
        {
          type: 'restrictReturnedAccounts',
          value: [MOCK_USER_ADDR]
        }
      ],
      date: 1655281294383,
      id: 'dpy3arq85464lWs6kl0AS',
      invoker: 'https://google.com',
      parentCapability: 'eth_accounts'
    }

    const mockPermissions = {
      'https://google.com': {
        origin: 'https://google.com',
        permissions: {
          eth_accounts: { ...mockCaveats }
        }
      }
    }

    const mockAccounts = {
      [MOCK_USER_ADDR]: {
        address: MOCK_USER_ADDR,
        privateKey: ''
      }
    }

    const mockRequestUserApproval = () =>
      new Promise((resolve, _) => {
        resolve(mockAccounts)
      })

    const mockRequestPermissions = () => Promise.resolve(mockPermissions)
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: mockRequestUserApproval,
        requestPermissions: mockRequestPermissions
      })
    } catch (error) {
      console.error(error)
    }

    expect(mockRes.result).toEqual([mockCaveats])
  })
})
