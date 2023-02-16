import { log, logErr } from '@shared/util/logger'
import { createFetchMiddleware, providerFromEngine } from 'eth-json-rpc-middleware'
import { JsonRpcEngine } from 'json-rpc-engine'
import { createSwappableProxy, createEventEmitterProxy } from 'swappable-obj-proxy'
import { PollingBlockTracker } from 'eth-block-tracker'
import NetworkStoreManager from './network-store-manager'
import { isValidHttpUrl } from '@shared/util/util'

/**
 * Manage networks storage (networks list, selected network)
 * Update web3Provider
 * @class
 */
export class NetworkController {
  constructor() {
    this._provider = null
    this._providerProxy = null
    this._blockTrackerProxy = null
    this._network = null
    this.store = new NetworkStoreManager()
    this.getNetworks = this.store.getNetworks.bind(this.store)
    this.addCustomNetwork = this.store.addCustomNetwork.bind(this.store)
    this.removeCustomNetwork = this.store.removeCustomNetwork.bind(this.store)
  }

  /**
   * Init default network provider
   *
   * @param {*} network - default network
   * @returns {Object} network
   */
  initializeProvider(network) {
    try {
      this._network = network
      this._configureProvider(network.rpcUrl)
      return this._network
    } catch (error) {
      throw error
    }
  }

  // return the proxies so the references will always be good
  getProviderAndBlockTracker() {
    const provider = this._providerProxy
    const blockTracker = this._blockTrackerProxy
    return { provider, blockTracker }
  }

  /**
   * Set stored selected network
   *
   * @param {*} network
   * @returns {Object} network
   */
  async updateNetworkProvider(network) {
    log('Update stored selected network: ', network)
    try {
      this._switchNetwork(network)
      return network
    } catch (error) {
      logErr(error)
      throw error
    }
  }

  getNetwork() {
    return this._network
  }

  //
  //  PRIVATE METHODS
  //

  _switchNetwork(network) {
    this._network = network
    this._configureProvider(network.rpcUrl)
  }

  _configureProvider(rpcUrl) {
    try {
      log('_configureProvider: ', rpcUrl)
      if (!isValidHttpUrl(rpcUrl)) {
        throw new Error(`${rpcUrl} is not a valid rpcUrl`)
      }
      const fetchMiddleware = createFetchMiddleware({
        rpcUrl
      })
      this._setNetworkClient(fetchMiddleware)
    } catch (error) {
      throw error
    }
  }

  _setNetworkClient(fetchMiddleware) {
    const engine = new JsonRpcEngine()
    engine.push(fetchMiddleware)
    const provider = providerFromEngine(engine)
    const blockTracker = new PollingBlockTracker({
      pollingInterval: 4000,
      provider: provider
    })
    this._setProviderAndBlockTracker({ provider, blockTracker })
  }

  _setProviderAndBlockTracker({ provider, blockTracker }) {
    log('_setProviderAndBlockTracker')
    // update or initialize proxies
    if (this._providerProxy) {
      this._providerProxy.setTarget(provider)
    } else {
      this._providerProxy = createSwappableProxy(provider)
    }
    if (this._blockTrackerProxy) {
      this._blockTrackerProxy.setTarget(blockTracker)
    } else {
      this._blockTrackerProxy = createEventEmitterProxy(blockTracker, {
        eventFilter: 'skipInternal'
      })
    }
    // set new provider
    this._provider = provider
    this._blockTracker = blockTracker
  }
}
