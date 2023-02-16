const { default: ExtensionStore } = require('@app/scripts/lib/local-store')
const { STORAGE_KEYS } = require('@shared/constant/app')
const { ALL_NETWORK_CONFIG_MAP } = require('@shared/constant/network')
const { default: NetworkStoreManager } = require('./network-store-manager')

let networkStoreManager
jest.mock('@app/scripts/lib/local-store')

const mockCustomNetwork = {
  bscTestnet: {}
}

describe('NetworkStoreManager', () => {
  beforeAll(() => {
    ExtensionStore.mockImplementation(() => {
      return {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({
              [STORAGE_KEYS.CUSTOM_NETWORKS]: mockCustomNetwork
            })
          })
        },
        set: (value) => {
          return new Promise((resolve, reject) => {
            resolve(value)
          })
        }
      }
    })
    networkStoreManager = new NetworkStoreManager()
  })

  describe('getNetworks', () => {
    it('get networks with store is null', async () => {
      networkStoreManager.storage = null
      await expect(networkStoreManager.getNetworks()).rejects.toThrow()
    })

    it('get networks without error', async () => {
      networkStoreManager.storage = new ExtensionStore()
      await expect(networkStoreManager.getNetworks()).resolves.toEqual({
        ...ALL_NETWORK_CONFIG_MAP,
        ...mockCustomNetwork
      })
    })
  })

  describe('addCustomNetwork', () => {
    it('add custom network with store is null', async () => {
      networkStoreManager.storage = null
      await expect(networkStoreManager.addCustomNetwork({})).rejects.toThrow()
    })

    it('add custom network without error', async () => {
      networkStoreManager.storage = new ExtensionStore()
      await expect(networkStoreManager.addCustomNetwork({})).resolves.toEqual({})
    })
  })

  describe('removeCustomNetwork', () => {
    it('remove custom network with store is null', async () => {
      networkStoreManager.storage = null
      await expect(networkStoreManager.removeCustomNetwork({})).rejects.toThrow()
    })

    it('remove custom network without error', async () => {
      networkStoreManager.storage = new ExtensionStore()
      await expect(networkStoreManager.removeCustomNetwork('bscTestnet')).resolves.toEqual({})
    })
  })
})
