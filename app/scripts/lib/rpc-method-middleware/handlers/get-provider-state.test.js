const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')
const { default: getProviderState } = require('./get-provider-state')

describe('getProviderStateHandler', () => {
  let { implementation } = getProviderState
  let mockEnd
  let mockReq
  let mockRes

  beforeAll(() => {
    mockEnd = (err) => {
      throw err
    }

    mockRes = {
      result: null
    }
  })

  it('should throw method not supported', async () => {
    await expect(implementation(mockReq, mockRes, null, mockEnd, {})).rejects.toThrow(
      'Method not supported.'
    )
  })

  it('should return provider state', async () => {
    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getProviderState: () =>
          Promise.resolve({ isUnlocked: false, chainId: '0x61', selectedAddress: MOCK_USER_ADDR })
      })
    } catch (error) {}
    expect(mockRes.result).toMatchObject({
      isUnlocked: false,
      chainId: '0x61',
      selectedAddress: MOCK_USER_ADDR
    })
  })
})
