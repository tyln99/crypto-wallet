import requestAccounts from './request-accounts'
const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')

describe('requestAccountsHandler', () => {
  let { implementation } = requestAccounts
  let mockEnd
  let mockReq
  let nonce
  let mockRes
  let getPermission
  let getState
  let requestPermissions
  let requestApproval

  beforeAll(() => {
    mockEnd = (err) => {
      throw err
    }

    mockReq = { origin: 'https://google.com', id: 123 }
    nonce = () => null

    mockRes = {
      result: null
    }

    getPermission = ({ origin }) => {
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

    getState = () =>
      Promise.resolve({
        selectedAddress: MOCK_USER_ADDR
      })

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

    requestPermissions = ({ origin }) => {
      if (origin !== 'https://google.com') {
        return Promise.resolve({})
      }
      return Promise.resolve(mockPermissions)
    }

    requestApproval = () =>
      Promise.resolve({
        [MOCK_USER_ADDR]: {
          address: MOCK_USER_ADDR
        }
      })
  })

  it('should throw method not support if not specify getAccounts', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: null,
        requestPermissions: nonce,
        getProviderState: nonce
      })
    ).rejects.toThrow('Method not supported.')
  })

  it('should throw requestPermissions is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        requestPermissions: null,
        getProviderState: nonce
      })
    ).rejects.toThrow('opts.requestPermissions is required')
  })

  it('should throw requestUserApproval is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: null,
        getPermission: nonce,
        requestPermissions: nonce,
        getProviderState: nonce
      })
    ).rejects.toThrow('opts.requestUserApproval is required')
  })

  it('should throw getProviderState is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        requestPermissions: nonce,
        getProviderState: null
      })
    ).rejects.toThrow('opts.getProviderState is required')
  })

  it('should return address if domain already has permission', async () => {
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: getPermission,
        requestPermissions: nonce,
        getProviderState: getState
      })
    } catch (error) {
      console.error(error)
    }

    expect(mockRes.result).toEqual([MOCK_USER_ADDR])
  })

  it('should ask user to grant permissions for this domain', async () => {
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: requestApproval,
        getPermission: () => Promise.resolve({}),
        requestPermissions: requestPermissions,
        getProviderState: getState
      })
    } catch (error) {
      console.error(error)
    }
    expect(mockRes.result).toEqual([MOCK_USER_ADDR])
  })
})
