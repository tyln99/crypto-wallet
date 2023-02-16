import { log } from '@shared/util/logger'
import ZWalletInpageProvider from './ZWalletInpageProvider'

/**
 * Initializes a MetaMaskInpageProvider and (optionally) assigns it as window.zwallet.
 *
 * @param {*} connectionStream - Node stream
 * @returns The provider instance.
 */
export default function initializeProvider({
  connectionStream,
  jsonRpcStreamName,
  logger = console,
  maxEventListeners = 100,
  shouldSetOnWindow = true
}) {
  let provider = new ZWalletInpageProvider(connectionStream, {
    jsonRpcStreamName,
    logger,
    maxEventListeners
  })

  provider = new Proxy(provider, {
    // some common libraries, e.g. web3@1.x, mess with our API
    deleteProperty: () => true
  })

  if (shouldSetOnWindow) {
    setGlobalProvider(provider)
  }

  return provider
}

/**
 * Sets the given provider instance as window.ethereum and dispatches the
 * 'zwallet#init' event on window.
 *
 * @param providerInstance - The provider instance.
 */
export function setGlobalProvider(providerInstance) {
  window.zwallet = providerInstance
  window.dispatchEvent(new Event('zwallet#init'))
  log('InpageProvider: ', providerInstance)
}
