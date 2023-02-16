import * as passworder from 'browser-passworder'
import { ACCOUNT_TYPE, DERIVATION_PATH, EMIT_METHODS, STORAGE_KEYS } from '@shared/constant/app'
import { log } from '@shared/util/logger'
import createMetaRPCHandler from './lib/createMetaRPCHandler'
import AppController from '@app/controllers/AppConroller'
import ExtensionStore from './lib/local-store'
import { ZWallet } from '@app/members/ZWallet'
import { ASCIIToString, compare, stringToASCII, toLowerCase } from '@shared/util/string'
import { NetworkController } from '@app/controllers/network/network'
import EthQuery from 'eth-query'
import { hdkey } from 'ethereumjs-wallet'
import * as bip39 from 'bip39'
import Web3 from 'web3'
import ExtensionPlatform from './lib/extension'
import { TokensController } from '@app/controllers/tokens/TokensController'
import { JsonRpcEngine } from 'json-rpc-engine'
import { providerAsMiddleware } from 'eth-json-rpc-middleware'
import { createEngineStream } from 'json-rpc-middleware-stream'
import pump from 'pump'
import { setupMultiplex } from './lib/stream-utils'
import { nanoid } from 'nanoid'
import TransactionController from '@app/controllers/transactions'
import createMethodMiddleware from './lib/rpc-method-middleware/createMethodMiddleware'
import ApprovalController from '@app/controllers/approval/ApprovalController'
import { EthereumRpcError } from 'eth-rpc-errors'
import createOriginMiddleware from './lib/createOriginMiddleware'
import ObservableStore from '@shared/util/obs-store'
import { forOwn, isEmpty, isNull } from 'lodash'
import createFilterMiddleware from 'eth-json-rpc-filters'
import createSubscriptionManager from 'eth-json-rpc-filters/subscriptionManager'
import { ALL_NETWORK_CONFIG_MAP, BSC } from '@shared/constant/network'
import PermissionController from '@app/controllers/permission'
import ContactsController from '@app/controllers/contacts'

/**
 * @class
 */
export class ZWalletController {
  /**
   * Initialize controller
   *
   * @param {Object} opts init options
   */
  constructor(opts) {
    log('Init ZWalletController: ', opts)
    this.zwallet = new ZWallet({ zwallet: {}, password: '' })
    this.appController = new AppController({ zwallet: this.zwallet, timeout: 86400000 })
    this.extensionStore = new ExtensionStore()
    this.zwalletState = new ObservableStore({
      chainId: null,
      selectedAddress: null,
      isUnlocked: null
    })
    this.extensionPlatform = new ExtensionPlatform()
    this.networkController = new NetworkController()
    this.permissionController = new PermissionController()
    // now we can initialize the RPC provider, which other controllers require
    this.initializeProvider(opts.initState)
    this.provider = this.networkController.getProviderAndBlockTracker().provider
    this.blockTracker = this.networkController.getProviderAndBlockTracker().blockTracker
    this.getNetwork = this.networkController.getNetwork.bind(this.networkController)

    this.tokensController = new TokensController({
      getNetwork: this.getNetwork,
      provider: this.provider
    })
    this.connections = {}
    this.txController = new TransactionController({
      provider: this.provider,
      blockTracker: this.blockTracker,
      getNetwork: this.getNetwork,
      initData: opts.initState[STORAGE_KEYS.TRANSACTIONS],
      notifyConnections: this.notifyConnections.bind(this)
    })
    this.updateInitialTransactions = this.txController.updateInitialTransactions.bind(
      this.txController
    )
    this.approvalController = new ApprovalController({
      showApprovalRequest: opts.showUserConfirmation
    })
    this.contactsController = new ContactsController()
  }

  /**
   * Initialize providers
   * @param {Object} initState Init state
   */
  initializeProvider(initState) {
    this.networkController.initializeProvider(ALL_NETWORK_CONFIG_MAP[BSC])
  }

  /**
   * Get provider state
   *
   * @returns {Object} provider state
   */
  getProviderState() {
    log('getProviderState', this.isUnlocked())
    return {
      isUnlocked: this.isUnlocked(),
      chainId: this.getNetwork().chainId,
      selectedAddress: this.zwalletState.getState().selectedAddress
    }
  }

  /**
   * A method for serving zwallet provider over a given stream.
   *
   * @param {*} outStream - The stream to provide over
   * @param {MessageSender | SnapSender} sender - The sender of the messages on this stream
   * @param {string} subjectType - The type of the sender
   */
  setupProviderConnection(outStream, sender, subjectType) {
    log('setupProviderConnection')
    let origin
    origin = new URL(sender.url).origin
    if (subjectType === 'internal') {
      origin = 'zwallet'
    }

    const engine = new JsonRpcEngine()
    // append origin to each request
    engine.push(createOriginMiddleware({ origin }))

    const { permissionController, txController } = this
    engine.push(
      createMethodMiddleware({
        origin,
        requestUserApproval: this.approvalController.addAndShowApprovalRequest.bind(
          this.approvalController
        ),
        getProviderState: this.getProviderState.bind(this),
        getNetwork: this.getNetwork.bind(this),
        updateNetworkProvider: this.updateNetworkProvider.bind(this),
        signMessage: this.signMessage.bind(this),
        requestPermissions: permissionController.requestPermissions.bind(permissionController),
        getPermission: permissionController.getPermission.bind(permissionController),
        getPermissions: permissionController.getPermissions.bind(permissionController),
        sendTransaction: txController.sendTransaction.bind(txController)
      })
    )

    // filter and subscription polyfills
    const { blockTracker, provider } = this
    // create filter polyfill middleware
    const filterMiddleware = createFilterMiddleware({ provider, blockTracker })
    // create subscription polyfill middleware
    const subscriptionManager = createSubscriptionManager({
      provider,
      blockTracker
    })
    subscriptionManager.events.on('notification', (message) => engine.emit('notification', message))
    engine.push(filterMiddleware)
    engine.push(subscriptionManager.middleware)

    // forward to  primary provider
    engine.push(providerAsMiddleware(this.provider))

    const providerStream = createEngineStream({ engine })
    const connectionId = this.addConnection(origin, { engine })
    pump(outStream, providerStream, outStream, (err) => {
      // handle any middleware cleanup
      engine._middleware.forEach((mid) => {
        if (mid.destroy && typeof mid.destroy === 'function') {
          mid.destroy()
        }
      })
      log('Remove connection id ', connectionId)
      connectionId && this.removeConnection(origin, connectionId)

      if (err) {
        log(err)
      }
    })
  }

  /**
   * Create stream for connecting to trusted context, like wallet UI
   *
   * @param {*} connectionStream - The duplex stream to connect to
   * @param {MessageSender} sender - The sender of the messages on this stream
   */
  setupInternalConnection(connectionStream, sender) {
    const mux = setupMultiplex(connectionStream)
    this.setupControllerConnection(mux.createStream('controller'))
    this.setupProviderConnection(mux.createStream('provider'), sender, 'internal')
  }

  /**
   * Create stream for connecting to untrusted context, like DApp
   *
   * @param {*} connectionStream - The duplex stream to connect to
   * @param {string} sender - The sender of the messages on this stream
   */
  setupExternalConnection(connectionStream, sender) {
    const mux = setupMultiplex(connectionStream)
    this.setupProviderConnection(mux.createStream('zwallet-provider'), sender)
  }

  /**
   * A method for providing our API over a stream using JSON-RPC.
   *
   * @param {*} outStream - The stream to provide our API over.
   */
  setupControllerConnection(outStream) {
    const api = this.getApi()
    // set up postStream transport
    this.outStream = outStream
    outStream.on('data', createMetaRPCHandler(api, outStream))
  }

  /**
   * Returns an Object containing API Callback Functions.
   * These functions are the interface for the UI.
   * The API object can be transmitted over a stream via JSON-RPC.
   *
   * @returns {Object} Object containing API functions.
   */
  getApi() {
    const {
      networkController,
      tokensController,
      txController,
      approvalController,
      permissionController,
      contactsController
    } = this

    return {
      updateState: this.updateStateAndNotify.bind(this),
      getState: () => this.zwalletState.getState(),
      isNewMember: this.isNewMember.bind(this),
      unlock: this.unlock.bind(this),
      lock: this.lock.bind(this),
      isUnlocked: this.isUnlocked.bind(this),
      getBalance: this.getBalance.bind(this),
      addAccount: this.addAccount.bind(this),
      importAccount: this.importAccount.bind(this),
      getWallet: this.getWallet.bind(this),
      getImportedAccounts: this.getImportedAccounts.bind(this),
      closePopup: this.closePopup.bind(this),
      getGasPrice: this.getGasPrice.bind(this),
      restoreWallet: this.restoreWallet.bind(this),
      clearImportedAccounts: this.clearImportedAccounts.bind(this),
      createNewWallet: this.createNewWallet.bind(this),
      getMnemonic: this.getMnemonic.bind(this),

      // Account
      addContact: contactsController.addContact.bind(contactsController),
      getContacts: contactsController.getContacts.bind(contactsController),
      searchContacts: contactsController.searchContacts.bind(contactsController),

      // NetworkController
      getNetwork: this.getNetwork.bind(this),
      getNetworks: networkController.getNetworks.bind(networkController),
      updateNetworkProvider: this.updateNetworkProvider.bind(this),
      addCustomNetwork: networkController.addCustomNetwork.bind(networkController),
      removeCustomNetwork: networkController.removeCustomNetwork.bind(networkController),

      // TokensController
      getListNFTS: tokensController.getListNFTS.bind(tokensController),
      getListTokens: tokensController.getListTokens.bind(tokensController),
      getTokenStandardAndDetails: tokensController.getTokenStandardAndDetails.bind(
        tokensController
      ),
      addToken: tokensController.addToken.bind(tokensController),
      addNFT: tokensController.addNFT.bind(tokensController),
      readAddressAsContract: tokensController.readAddressAsContract.bind(tokensController),

      // TransactionController
      sendTransaction: txController.sendTransaction.bind(txController),
      getTransactions: txController.getTransactions.bind(txController),
      estimateGas: txController.estimateGas.bind(txController),

      // ApprovalController
      resolvePendingApproval: approvalController.accept.bind(approvalController),
      rejectPendingApproval: (id, error) => {
        approvalController.reject(id, new EthereumRpcError(error.code, error.message, error.data))
      },

      // PermissionController
      requestPermissions: permissionController.requestPermissions.bind(permissionController),
      getPermissions: permissionController.getPermissions.bind(permissionController),
      getPermission: permissionController.getPermission.bind(permissionController),
      removePermission: permissionController.removePermission.bind(permissionController)
    }
  }

  /**
   * Signifies user intent to complete an eth_sign method.
   *
   * @param {string} message - The message pass to eth_sign
   * @param {string} privKey - Account privateKey
   * @returns {string} Signed message
   */
  signMessage(message, privKey) {
    const web3 = new Web3()
    return web3.eth.accounts.sign(message, privKey)
  }

  /**
   * Change current network provider
   *
   * @param {*} network - new network
   */
  updateNetworkProvider(network) {
    const currChainId = this.zwalletState.getState().chainId
    if (network.chainId !== currChainId) {
      this.networkController.updateNetworkProvider(network)
      this.updateStateAndNotify({ chainId: network.chainId })
    }
  }

  /**
   * Adds a reference to a connection by origin. Ignores the 'zwallet' origin.
   * Caller must ensure that the returned id is stored such that the reference
   * can be deleted later.
   *
   * @param {string} origin - The connection's origin string.
   * @param {Object} options.engine - The connection's JSON Rpc Engine
   * @returns {string} The connection's id (so that it can be deleted later)
   */
  addConnection(origin, { engine }) {
    if (origin === 'zwallet') {
      return null
    }

    if (!this.connections[origin]) {
      this.connections[origin] = {}
    }

    const id = nanoid()
    this.connections[origin][id] = {
      engine
    }

    log('Add connections: ', this.connections)
    return id
  }

  /**
   * Deletes a reference to a connection, by origin and id.
   * Ignores unknown origins.
   *
   * @param {string} origin - The connection's origin string.
   * @param {string} id - The connection's id, as returned from addConnection.
   */
  removeConnection(origin, id) {
    const connections = this.connections[origin]
    if (!connections) {
      return
    }

    delete connections[id]

    if (Object.keys(connections).length === 0) {
      delete this.connections[origin]
    }
  }

  /**
   * Causes the RPC engines associated with the connections to the given origin
   * to emit a notification event with the given payload.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * Ignores unknown origins.
   *
   * @param {string} origin - The connection's origin string.
   * @param {unknown} payload - The event payload.
   */
  notifyConnections(origin, payload) {
    log('notifyConnections', origin, payload)
    const connections = this.connections[origin]

    if (connections) {
      Object.values(connections).forEach((conn) => {
        if (conn.engine) {
          conn.engine.emit('notification', payload)
        }
      })
    }
  }

  /**
   * Causes the RPC engines associated with all connections to emit a
   * notification event with the given payload.
   *
   * If the "payload" parameter is a function, the payload for each connection
   * will be the return value of that function called with the connection's
   * origin.
   *
   * The caller is responsible for ensuring that only permitted notifications
   * are sent.
   *
   * @param {unknown} payload - The event payload, or payload getter function.
   */
  notifyAllConnections(payload) {
    log('notifyAllConnections', this.connections, payload)
    const getPayload = typeof payload === 'function' ? (origin) => payload(origin) : () => payload

    Object.keys(this.connections).forEach((origin) => {
      Object.values(this.connections[origin]).forEach(async (conn) => {
        if (conn.engine) {
          conn.engine.emit('notification', await getPayload(origin))
        }
      })
    })
  }

  /**
   * Get current gasPrice
   *
   * @returns {Promise<HexString>} gasPrice of this network
   */
  async getGasPrice() {
    try {
      const gasPrice = await new Promise((resolve, reject) => {
        const ethQuery = new EthQuery(this.provider)
        ethQuery.gasPrice((error, rs) => {
          if (error) {
            reject(error)
          } else {
            resolve(rs || '0x0')
          }
        })
      })
      return gasPrice
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Check is user has locked in or not
   *
   * @returns {Promise<boolean>} is wallet locked
   */
  isUnlocked() {
    return this.appController.checkUnlocked()
  }

  /**
   * Check if wallet encrypted data already store in local
   *
   * @returns {Promise<boolean>} is new member
   */
  async isNewMember() {
    const data = await this.extensionStore.get()
    return !isEmpty(data[STORAGE_KEYS.WALLET]) && !isEmpty(data[STORAGE_KEYS.IMPORTED_ACCOUNTS])
  }

  /**
   * Unlock wallet
   *
   * @param {*} password - password of this wallet
   * @returns {Promise<boolean>} success or fail
   */
  async unlock(password) {
    let storageData = await this.extensionStore.get()
    const walletData = storageData[STORAGE_KEYS.WALLET]
    if (isNull(walletData) || isEmpty(walletData)) {
      throw new Error("Wallet doesn't exists, let's import or create a new one!")
    }
    try {
      const decryptedWallet = await passworder.decrypt(password, walletData)
      log('decryptedWallet: ', decryptedWallet)
      this.zwallet.setZWallet({ zwallet: decryptedWallet, password: password })
      this.appController.setUnlocked()
      this.updateStateAndNotify({ isUnLocked: true })
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Lock out this wallet
   *
   * @returns {Promise<boolean>} success
   */
  async lock() {
    this.appController.setLocked()
    this.zwallet.clearZWallet()
    this.updateStateAndNotify({ isUnLocked: false })
    return true
  }

  /**
   * Create new wallet
   *
   * @param {*} mnemonic - menemonic for HDWallet
   * @param {*} password - password to encrypt
   * @returns {Promise<boolean>} success or fail
   */
  async createNewWallet(mnemonic, password) {
    try {
      const newWallet = {
        mnemonic: stringToASCII(mnemonic),
        numberOfAccount: 1,
        hdPath: DERIVATION_PATH
      }
      this.zwallet.setZWallet({ zwallet: newWallet, password: password })
      await this.updateWalletStorage(newWallet, password)
      await this.contactsController.clearContacts()
      return true
    } catch (err) {
      throw err
    }
  }

  /**
   * Encrypt wallet and store to local
   *
   * @param {*} data - wallet
   * @param {*} password - password for encypt
   * @returns {Promise}
   */
  async updateWalletStorage(data, password) {
    const vault = await passworder.encrypt(password, data)
    await this.extensionStore.set({ [STORAGE_KEYS.WALLET]: vault })
  }

  /**
   * get balance for specified account
   *
   * @async
   * @param {*} address - account address
   * @returns {Promise<string>} balance of this address
   */
  async getBalance(address) {
    return await new Promise((resolve, reject) => {
      const ethQuery = new EthQuery(this.provider)
      ethQuery.getBalance(address, (error, balance) => {
        if (error) {
          reject(error)
        } else {
          resolve(balance || '0x0')
        }
      })
    })
  }

  /**
   * Get seed phrases
   *
   * @returns {string} wallet seed
   */
  getMnemonic = () => {
    const { mnemonic } = this.zwallet.zwallet
    return ASCIIToString(mnemonic)
  }

  /**
   * Parse from menemonic to list of accounts
   *
   * @returns {Promise<Array>} list accounts of this wallet
   */
  async getWallet() {
    try {
      const { mnemonic, numberOfAccount } = this.zwallet.zwallet
      const hdwallet = hdkey.fromMasterSeed(await bip39.mnemonicToSeed(ASCIIToString(mnemonic)))
      const accounts = []
      const contacts = await this.contactsController.getContacts()
      for (let i = 0; i < numberOfAccount; i++) {
        const wallet = hdwallet.derivePath(DERIVATION_PATH + i).getWallet()
        const addr = '0x' + wallet.getAddress().toString('hex')
        let contactInfo = contacts[`${addr}`.toLowerCase()]
        if (i === 0 && !contactInfo) {
          contactInfo = 'Account 1'
        }
        accounts.push({
          privateKey: wallet.privateKey.toString('hex'),
          publicKey: wallet.publicKey.toString('hex'),
          address: `${addr}`,
          balance: 0,
          contactInfo
        })
      }
      log('Get wallet: ', accounts)
      return accounts
    } catch (error) {
      throw error
    }
  }

  /**
   * Restore wallet from mnemonic and new password
   *
   * @param {*} mnemonic
   * @param {*} password
   * @returns {Promise<boolean>} is success
   */
  async restoreWallet(mnemonic, password) {
    try {
      const restoreData = {
        mnemonic: stringToASCII(mnemonic),
        numberOfAccount: 1,
        hdPath: DERIVATION_PATH
      }
      this.zwallet.setZWallet({ zwallet: restoreData, password: password })
      await this.updateWalletStorage(restoreData, password)
      await this.contactsController.clearContacts()
      return true
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Increase number of accounts in this wallet
   *
   * @returns {Promise<boolean>} success or fail
   */
  async addAccount() {
    try {
      if (!this.isUnlocked()) {
        throw new Error('Wallet is locked, please unlock')
      }
      let storageData = await this.extensionStore.get()
      const walletData = storageData[STORAGE_KEYS.WALLET]
      if (isEmpty(walletData) || isNull(walletData)) {
        throw new Error("Wallet doesn't exists!")
      }
      const decryptedWallet = await passworder.decrypt(this.zwallet.password, walletData)
      decryptedWallet.numberOfAccount = decryptedWallet.numberOfAccount + 1
      this.zwallet.setZWallet({ zwallet: decryptedWallet, password: this.zwallet.password })
      await this.updateWalletStorage(decryptedWallet, this.zwallet.password)
      return true
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Get list imported accounts
   *
   * @returns {Promise<boolean>} list imported accounts
   */
  async getImportedAccounts() {
    try {
      const storageData = await this.extensionStore.get()
      const importedData = storageData[STORAGE_KEYS.IMPORTED_ACCOUNTS]
      if (!isEmpty(importedData) && !isNull(importedData)) {
        const importedAccounts = await passworder.decrypt(this.zwallet.password, importedData)
        const contacts = await this.contactsController.getContacts()
        for (var account of importedAccounts) {
          account.contactInfo = contacts[account.address.toLowerCase()]
        }
        return importedAccounts
      }
      return []
    } catch (error) {
      throw error
    }
  }

  /**
   * Clear list imported accounts
   */
  async clearImportedAccounts() {
    await this.extensionStore.set({ ImportedAccounts: null })
  }

  /**
   * Import new account
   *
   * @param {*} privateKey - privateKey to get account
   * @returns {Promise<boolean>} success or fail
   */
  async importAccount(privateKey) {
    let newImportAccount
    try {
      const web3 = new Web3()
      newImportAccount = web3.eth.accounts.privateKeyToAccount(privateKey) // generate account from private key
      log('Temporary new acc: ', newImportAccount)
      if (newImportAccount) {
        const imported = await this.getImportedAccounts()
        const accounts = await this.getWallet()
        log({ imported, accounts })

        let accountIsExists = false
        for (let account of imported) {
          if (compare(account.address, newImportAccount.address)) {
            accountIsExists = true
            break
          }
        }
        for (const account of accounts) {
          if (compare(account.address, newImportAccount.address)) {
            accountIsExists = true
            break
          }
        }
        if (accountIsExists) {
          log('Account is already exists')
          throw new Error('Account is already exists')
        }

        // store new imported account
        newImportAccount.type = ACCOUNT_TYPE.IMPORTED
        newImportAccount.address = toLowerCase(newImportAccount.address)
        const newImportedAccounts = [...imported, newImportAccount]
        log('this.zwallet: ', this.zwallet)
        const importedAccountsVault = await passworder.encrypt(
          this.zwallet.password,
          newImportedAccounts
        )
        await this.extensionStore.set({ ImportedAccounts: importedAccountsVault })
        return newImportAccount
      } else {
        throw new Error('Private key is invalid')
      }
    } catch (error) {
      log(error.message)
      throw error
    }
  }

  /**
   * Update stored selected account
   *
   * @param {*} account - new selected account
   * @returns {Promise<boolean>}
   */
  async updateStateAndNotify(state) {
    if (!state) {
      return null
    }
    log('On update ZWalletState', state)
    this.zwalletState.updateState({
      ...this.zwalletState.getState(),
      ...state
    })
    forOwn(state, (value, key) => {
      switch (key) {
        case 'selectedAddress':
          this.notifyAllConnections({
            method: EMIT_METHODS.ACCOUNT_CHANGED,
            params: value
          })
          return value

        case 'chainId':
          this.notifyAllConnections({
            method: EMIT_METHODS.CHAIN_CHANGED,
            params: value
          })
          return value

        default:
          break
      }
    })
  }

  /**
   * Close popup
   */
  closePopup = () => {
    this.extensionPlatform.closeCurrentWindow()
  }
}
