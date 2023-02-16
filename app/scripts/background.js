//current only support top frame: injectscript, webNavigation.onCompleted
import extension from './lib/extensionizer'
import ExtensionPlatform from './lib/extension'
import {
  ENV_TYPE_POPUP,
  ENV_TYPE_NOTIFICATION,
  ENV_TYPE_FULLSCREEN
} from '../../shared/constant/app'
import { log, logErr } from '@shared/util/logger'
import PortStream from 'extension-port-stream'
import { ZWalletController } from './zwallet-controller'
import NotificationManager from './lib/notification-manager'
import * as storageMigrations from '@shared/util/storage-migrations'
import { SECOND } from '@shared/constant/time'

// let ConnectionFactory = null
const notificationManager = new NotificationManager()

//log.setDefaultLevel(process.env.ZWallet_DEBUG ? 'debug' : 'info');
//TODO: for check excute internal app
const zwalletInternalProcessHash = {
  [ENV_TYPE_POPUP]: true,
  [ENV_TYPE_NOTIFICATION]: true,
  [ENV_TYPE_FULLSCREEN]: true
}

const { storage } = extension

/**
 * Initializes the ZWallet controller, and sets up all platform configuration.
 */
async function initialize() {
  const storageData = await storageMigrations.initializeStorageData()

  setupController(storageData)
}
initialize().catch(logErr)

let controller

/**
 * Initializes the ZWallet Controller with any initial state.
 * Creates platform listeners for new Dapps/Contexts, and sets up their data connections to the controller.
 *
 * @param {*} initState - The initial state to start the controller with, matches the state that is emitted from the controller.
 */
const setupController = (initState) => {
  let popupIsOpen = false
  let notificationIsOpen = false
  let uiIsTriggering = false
  const openZWalletTabsIDs = {}
  const requestAccountTabIds = {}

  const platform = new ExtensionPlatform()
  controller = new ZWalletController({ initState, showUserConfirmation: triggerUi })

  //handle post message, polling keep connection
  extension.runtime.onConnect.addListener(connectRemote)

  async function connectRemote(port) {
    log('BG connect:', port)
    let connectionStream = new PortStream(port)
    const isInternal = zwalletInternalProcessHash[port.name]

    if (isInternal) {
      controller.setupInternalConnection(connectionStream, port.sender)
    } else {
      controller.setupExternalConnection(connectionStream, port.sender)
    }
  }

  //open popup from request contentscript (base on message)
  async function triggerUi(opts) {
    log('triggerUi', opts)
    if (opts) {
      await storage.local.set({ data: opts }) // Add LAYOUT
    }
    const tabs = await platform.getActiveTabs()
    const currentlyActiveZWalletTab = Boolean(tabs.find((tab) => openZWalletTabsIDs[tab.id]))
    // Vivaldi is not closing port connection on popup close, so popupIsOpen does not work correctly
    // To be reviewed in the future if this behaviour is fixed - also the way we determine isVivaldi variable might change at some point
    const isVivaldi =
      tabs.length > 0 && tabs[0].extData && tabs[0].extData.indexOf('vivaldi_tab') > -1
    if (!uiIsTriggering && (isVivaldi || !popupIsOpen) && !currentlyActiveZWalletTab) {
      uiIsTriggering = true
      try {
        await notificationManager.showPopup()
      } finally {
        uiIsTriggering = false
      }
    }
  }

  async function openPopup() {
    await triggerUi()
    await new Promise((resolve) => {
      const interval = setInterval(() => {
        if (!notificationIsOpen) {
          clearInterval(interval)
          resolve()
        }
      }, 1000)
    })
  }
}

// ------------------- LISTENER --------------------

extension.runtime.onInstalled.addListener((details) => {
  log('onInstalled', details)
  //biz for install or update extension
  if (details.reason === 'install') {
    //platform.openExtensionInBrowser();
  } else if (details.reason === 'update') {
    let preVersion = details.previousVersion
    let manifest = extension.runtime.getManifest()
    if (preVersion === '1.0' && manifest.version !== '1.0') {
      // new version is store ALL ADDRESS as LOWER CASE
      // reformatStoredData()
    } else if (preVersion === '1.0.2' && manifest.version !== '1.0.2') {
      // Clear networks stored for update new BSC Testnet RPC url
      // clearNetworksStored()
      // clearActivitiesStored()
    } else if (preVersion === '1.0.3' && manifest.version !== '1.0.3') {
      // Clear networks stored for update new BSC Testnet RPC url
      // clearNetworksStored()
    } else if (preVersion === '1.0.4' && manifest.version !== '1.0.4') {
      setTimeout(() => {
        //? wait for controller (ZWalletController) is initializeemitemitd
        storageMigrations.activitiesToTransactions({
          callback: controller && controller.updateInitialTransactions
        })
      }, SECOND * 3)
    } else if (preVersion === '2.0.2' && manifest.version !== '2.0.2') {
      storageMigrations.migrateNFTs()
    } else if (preVersion === '2.0.3' && manifest.version !== '2.0.3') {
      storageMigrations.refactorContacts()
    }
  }
})
