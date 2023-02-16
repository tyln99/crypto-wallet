import ExtensionStore from '@app/scripts/lib/local-store'
import { STORAGE_KEYS } from '@shared/constant/app'
import { ALL_NETWORK_CONFIG_MAP } from '@shared/constant/network'
import { logErr } from '@shared/util/logger'

/**
 * Manage network storage
 * @class
 */
export default class NetworkStoreManager {
  constructor() {
    this.storage = new ExtensionStore()
  }

  /**
   * Get list stored networks config
   *
   * @returns {Promise<Object>} networks config
   */
  async getNetworks() {
    try {
      const customNetworks = (await this.storage.get())[STORAGE_KEYS.CUSTOM_NETWORKS] || {}
      return { ...ALL_NETWORK_CONFIG_MAP, ...customNetworks }
    } catch (error) {
      logErr(error)
      throw error
    }
  }

  /**
   * Add custom network
   *
   * @param {Object} network
   */
  async addCustomNetwork(network) {
    try {
      const currData = (await this.storage.get())[STORAGE_KEYS.CUSTOM_NETWORKS]
      await this.storage.set({
        [STORAGE_KEYS.CUSTOM_NETWORKS]: {
          ...currData,
          ...network
        }
      })
      return network
    } catch (error) {
      logErr(error)
      throw error
    }
  }

  /**
   * Remove custom network
   *
   * @param {string} key - key for remove
   */
  async removeCustomNetwork(key) {
    try {
      const currData = (await this.storage.get())[STORAGE_KEYS.CUSTOM_NETWORKS]
      delete currData[key]
      await this.storage.set({
        [STORAGE_KEYS.CUSTOM_NETWORKS]: currData
      })
      return currData
    } catch (error) {
      logErr(error)
      throw error
    }
  }
}
