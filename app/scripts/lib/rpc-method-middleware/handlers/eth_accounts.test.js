const { logWarn } = require('@shared/util/logger')
const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')
const { default: ethAccounts } = require('./eth_accounts')

describe('ethAccountHandler', () => {
  let { implementation } = ethAccounts
  let mockEnd
  let mockReq
  let mockRes
  let nonce = () => {}

  beforeEach(() => {
    mockEnd = (err) => {
      throw err
    }
    mockReq = { origin: 'https://google.com' }

    mockRes = {
      result: null
    }
  })

  let getPermission = ({ origin }) => {
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

  let getState = () =>
    Promise.resolve({
      selectedAddress: MOCK_USER_ADDR
    })

  it('should throw method not supported', async () => {
    await expect(implementation(mockReq, mockRes, null, mockEnd, {})).rejects.toThrow(
      'Method not supported.'
    )
  })

  it('should throw getProviderState is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        getPermission: nonce
      })
    ).rejects.toThrow('opts.getProviderState is required')
  })

  it('should return empty if domain has not permission', async () => {
    mockReq = { origin: 'https://zing.me' }
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getPermission: getPermission,
        getProviderState: nonce
      })
    } catch (error) {
      logWarn(error)
    }
    expect(mockRes.result).toEqual([])
  })

  it('should return array of one address if it has permission', async () => {
    mockReq = { origin: 'https://google.com' }
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getPermission: getPermission,
        getProviderState: getState
      })
    } catch (error) {
      logWarn(error)
    }
    expect(mockRes.result).toEqual([MOCK_USER_ADDR])
  })
})
