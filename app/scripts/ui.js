/**Load extension when click on icon in browser */
import extension from './lib/extensionizer'
import { getEnvironmentType } from './lib/utils'
import launchUi from '../../ui/index'
import ExtensionStore from './lib/local-store'
import { log, logErr } from '@shared/util/logger'
import PortStream from 'extension-port-stream'
import ObjectMultiplex from 'obj-multiplex'
import pump from 'pump'
import metaRPCClientFactory from './lib/MetaRPCClient'
import ExtensionPlatform from './lib/extension'
import EthQuery from 'eth-query'
import StreamProvider from 'web3-stream-provider'
import * as Sentry from '@sentry/react'
import { BrowserTracing } from '@sentry/tracing'

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DNS,
  // integrations: [new BrowserTracing()],
  integrations: [new Sentry.Integrations.Breadcrumbs({ console: false })],
  tracesSampleRate: 1.0
})

start().catch((err) => log(err))
const extensionStore = new ExtensionStore()

async function start() {
  const container = document.getElementById('root')
  log('container', container)
  // create platform global
  global.platform = new ExtensionPlatform()
  // identify window type (popup, notification)
  log('window.location.href', window.location.href)
  const windowType = getEnvironmentType(window.location.href)
  log(windowType)
  const activeTab = await queryCurrentActiveTab(windowType)
  // setup stream to background
  setupStreams(windowType, (err, backgroundConnection) => {
    if (err) {
      return log(err)
    }
    if (backgroundConnection) {
      return extensionStore
        .get()
        .then(async (value) => {
          if (value.data) {
            await extensionStore.set({ data: null }) // clear popup layout
          }

          backgroundConnection.getState((err, zwalletState) => {
            if (err) {
              // logErr(err)
            }

            launchUi(
              {
                container,
                activeTab,
                data: value.data,
                backgroundConnection,
                zwalletState
              },
              (params) => {
                log('launchUi callback: ', params)
              }
            )
          })
        })
        .catch(log)
    }
  })
}

async function queryCurrentActiveTab() {
  return new Promise((resolve) => {
    // At the time of writing we only have the `activeTab` permission which means
    // that this query will only succeed in the popup context (i.e. after a "browserAction")
    let isFirefox = typeof InstallTrigger !== 'undefined'
    let tabQueryParams = { active: true, currentWindow: true }
    if (isFirefox) {
      tabQueryParams = Object.assign({}, { active: true })
    }
    extension.tabs.query(tabQueryParams, (tabs) => {
      log('current active tab', tabs)
      let newTabs = [...tabs]
      if (isFirefox && tabs.length > 1) {
        for (let i in tabs) {
          if (tabs[i].url && tabs[i].url.indexOf('http') == 0) {
            newTabs = [Object.assign({}, tabs[i])]
            break
          }
        }
      }
      const [activeTab] = newTabs
      const { id, title, url } = activeTab
      const { origin, protocol } = url ? new URL(url) : {}

      // because if notification, do not have url
      // if (!origin || origin === 'null') {
      //   resolve({})
      //   return
      // }

      resolve({ id, title, origin, protocol, url })
    })
  })
}

async function setupStreams(windowType, cb) {
  let extensionPort = extension.runtime.connect({ name: windowType })
  const connectionStream = new PortStream(extensionPort)
  const mux = new ObjectMultiplex()
  pump(connectionStream, mux, connectionStream, (err) => {
    //pip streams
    if (err) {
      log('Lost connection POPUP <-> BG: ', err)
    }
  })
  const outStream = mux.createStream('controller') //connect to controller and mapping RPC-JSON api in controller background
  const backgroundRPC = metaRPCClientFactory(outStream) //using backgroundRPC to call background function

  //connection for web3: provider
  setupWeb3Connection(mux.createStream('provider'))

  cb(null, backgroundRPC)
}

/**
 * Establishes a streamed connection to a Web3 provider
 *
 * @param {PortDuplexStream} connectionStream - PortStream instance establishing a background connection
 */
function setupWeb3Connection(connectionStream) {
  const providerStream = new StreamProvider()
  providerStream.pipe(connectionStream).pipe(providerStream)
  connectionStream.on('error', console.info.bind(console))
  providerStream.on('error', console.info.bind(console))
  global.ethereumProvider = providerStream
  global.ethQuery = new EthQuery(providerStream)
  // global.eth = new Eth(providerStream)
}
