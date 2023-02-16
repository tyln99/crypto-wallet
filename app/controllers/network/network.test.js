const { default: ExtensionStore } = require('@app/scripts/lib/local-store')
const { STORAGE_KEYS } = require('@shared/constant/app')
const { NetworkController } = require('./network')
jest.mock('@app/scripts/lib/local-store')

let networkController
const MOCK_NETWORK = {
  rpcUrl: 'https://google.com'
}

const MOCK_INVALID_NETWORK = {
  rpcUrl: 'abcd'
}

describe('NetworkController', () => {
  beforeAll(() => {
    ExtensionStore.mockImplementation(() => {
      return {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({})
          })
        },
        set: (value) => {
          return new Promise((resolve, reject) => {
            resolve(value)
          })
        }
      }
    })
    networkController = new NetworkController()
  })

  describe('initializeProvider', () => {
    it('given invalid network', () => {
      expect(() => networkController.initializeProvider(MOCK_INVALID_NETWORK)).toThrow()
    })
    it('given valid network', () => {
      const rs = networkController.initializeProvider(MOCK_NETWORK)
      expect(rs.rpcUrl).toEqual('https://google.com')
    })
  })

  describe('getProviderAndBlockTracker', () => {
    beforeAll(() => {
      networkController.initializeProvider(MOCK_NETWORK)
    })

    it('get provider and block tracker', () => {
      const getFn = networkController.getProviderAndBlockTracker()
      expect(getFn).toEqual({ blockTracker: {}, provider: {} })
    })
  })

  describe('updateNetworkProvider', () => {
    it('given invalid network', async () => {
      const updateRs = networkController.updateNetworkProvider({
        rpcUrl: "i'm invalid url"
      })
      await expect(updateRs).rejects.toThrow()
    })
    it('given valid network', async () => {
      const updateRs = networkController.updateNetworkProvider(MOCK_NETWORK)
      await expect(updateRs).resolves.toEqual(MOCK_NETWORK)
    })
  })
})
