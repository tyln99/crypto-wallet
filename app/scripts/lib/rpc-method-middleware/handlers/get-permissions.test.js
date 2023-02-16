const { default: getPermissions } = require('./get-permissions')
const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')

describe('getPermissions', () => {
  let { implementation } = getPermissions
  let mockEnd
  let mockReq
  let mockRes

  beforeAll(() => {
    mockReq = { origin: 'https://google.com', id: 123 }
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

  it('should return permissions', async () => {
    const getPermission = ({ origin }) => {
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

    try {
      await implementation(mockReq, mockRes, null, mockEnd, {
        getPermission: getPermission
      })
    } catch (error) {
      console.error(error)
    }
    expect(mockRes.result).toEqual([
      {
        caveats: [{ value: [MOCK_USER_ADDR] }]
      }
    ])
  })
})
