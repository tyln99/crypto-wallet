import { TRANSACTION_STATUSES } from '@shared/constant/app'
import { log } from '@shared/util/logger'
import EthQuery from 'eth-query'
import pify from 'pify'
import SafeEventEmitter from 'safe-event-emitter'
import PendingTransactionTracker from './pending-tx-tracker'
import TransactionStateManager from './tx-state-manager'
import { Transaction } from '@ethereumjs/tx'
import Common from '@ethereumjs/common'
import ObservableStore from '@shared/util/obs-store'

const { PENDING, UNAPPROVED, CONFIRMED } = TRANSACTION_STATUSES

/**
 * @class
 */
export class TransactionController extends SafeEventEmitter {
  constructor(opts) {
    super()
    this.provider = opts.provider
    this.blockTracker = opts.blockTracker
    this.getNetwork = opts.getNetwork
    this.notifyConnections = opts.notifyConnections
    this.query = new EthQuery(this.provider)
    this.promisifiedQuery = pify(this.query)
    this.txStateManager = new TransactionStateManager({
      getNetwork: this.getNetwork.bind(this),
      initData: opts.initData
    })
    this.updateInitialTransactions = this.txStateManager.updateInitialTransactions.bind(
      this.txStateManager
    )
    this.pendingTxTracker = new PendingTransactionTracker({
      query: this.promisifiedQuery,
      getPendingTransactions: () => {
        const pending = this.txStateManager.getPendingTransactions()
        return pending
      }
    })
    this.getTransactions = this.txStateManager.getTransactions.bind(this.txStateManager)
    this._setupListeners()
    this.store = new ObservableStore({ connections: {} })
  }

  /**
   * Adds a tx to the txlist
   *
   * @param txMeta
   * @fires ${txMeta.id}:unapproved
   */
  addTransaction(txMeta) {
    this.txStateManager.addTransaction(txMeta)
    // this.emit(`${txMeta.id}:unapproved`, txMeta)
    // this._trackTransactionMetricsEvent(txMeta, TRANSACTION_EVENTS.ADDED)
  }

  /**
   * Generate a new transaction and add to transactions state
   *
   * @param {Object} txMeta - transaction input
   * @param {string} origin - origin
   * @returns {string} transaction hash
   */
  async sendTransaction(txMeta, origin) {
    let transaction
    try {
      log('On send transaction', txMeta)
      const { from, gas, gasPrice, to, value, data, txDetails } = txMeta
      const { address: fromAddr, privateKey } = from
      const nonce = await this.promisifiedQuery.getTransactionCount(fromAddr)
      transaction = {
        from: fromAddr,
        gasPrice,
        gasLimit: gas,
        to,
        value,
        data,
        nonce
      }
      const rawTx = await this._signTransaction(transaction, privateKey)
      log(rawTx)
      const newTxMeta = this.txStateManager.generateTxMeta(transaction)
      newTxMeta.status = UNAPPROVED // use unapproved for init transaction status
      newTxMeta.txDetails = txDetails
      this.txStateManager.addTransaction(newTxMeta)
      const txObject = await this.publishTransaction(newTxMeta, rawTx)
      return txObject.hash
    } catch (error) {
      // logErr({
      //   functionName: '[SendTransaction]',
      //   error,
      //   data: { ...transaction },
      //   captureSentry: true
      // })
      throw error
    }
  }

  _storeConnection(origin, txData) {
    this.store.updateState({
      connections: {
        [txData.id]: origin,
        ...this.store.getState().connections
      }
    })
  }

  /**
   * Add transaction to state
   *
   * @param {*} txMeta - tx data
   * @param {*} rawTx - raw tx for send
   * @returns {Object} transaction data
   */
  async publishTransaction(txMeta, rawTx) {
    try {
      const hash = await this.promisifiedQuery.sendRawTransaction(rawTx)
      log('hash', hash)
      txMeta.hash = hash
      txMeta.status = PENDING
      this.txStateManager.updateTransaction(txMeta)
      return txMeta
      // update txMeta by txId
    } catch (error) {
      this._failTransaction(txMeta.id, error)
      throw error
    }
  }

  /**
   * Estimate gas
   *
   * @param {*} estimateGasParams
   * @returns estimated gas
   */
  estimateGas(txParams) {
    return new Promise((resolve, reject) => {
      return this.query.estimateGas(txParams, (err, res) => {
        if (err) {
          return reject(err)
        }
        return resolve(res)
      })
    })
  }

  //
  // PRIVATE METHODS
  //

  async _signTransaction(txData, privateKey) {
    try {
      const currentChain = this.getNetwork()
      const common = Common.custom({
        chainId: Number(currentChain.chainId)
      })

      var tx = new Transaction(txData, { common })
      privateKey = Buffer.from(
        privateKey.length === 66 ? privateKey.substring(2) : privateKey,
        'hex'
      )

      var signedTx = tx.sign(privateKey)
      var serializedTx = signedTx.serialize()
      var rawTxHex = '0x' + serializedTx.toString('hex')
      return rawTxHex
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * is called in constructor applies the listeners for pendingTxTracker txStateManager
   * and blockTracker
   */
  _setupListeners() {
    this._setupBlockTrackerListener()
    this.pendingTxTracker.on('tx:failed', (txId, error) => {
      log('tx:failed', txId, error)
      this._failTransaction(txId, error)
    })
    this.pendingTxTracker.on(
      'tx:confirmed',
      (txId, transactionReceipt, baseFeePerGas, blockTimestamp) => {
        log('tx:confirmed', txId)
        this._confirmTransaction(txId, transactionReceipt, baseFeePerGas, blockTimestamp)
      }
    )
  }

  _setupBlockTrackerListener() {
    log('_setupBlockTrackerListener')
    let listenersAreActive = false
    const { blockTracker, txStateManager } = this
    const latestBlockHandler = this._onLatestBlock.bind(this)
    this.txStateManager.on('tx:status-update', (txId, txMeta, status) => {
      updateSubscription()
    })

    updateSubscription()
    function updateSubscription() {
      const pendingTxs = txStateManager.getPendingTransactions()
      log('pendingTxs', pendingTxs)
      if (!listenersAreActive && pendingTxs.length > 0) {
        // log('Add block listener')
        blockTracker.on('latest', latestBlockHandler)
        listenersAreActive = true
      } else if (listenersAreActive && !pendingTxs.length) {
        // log('Remove block listener')
        blockTracker.removeListener('latest', latestBlockHandler)
        listenersAreActive = false
      }
    }
  }

  // // Notify tx update to inpage
  // notifyTxUpdate(txId, data) {
  //   const origin = this.store.getState().connections[txId]
  //   origin && this.notifyConnections(origin, { method: EMIT_METHODS.TRANSACTION_UPDATE, data })
  // }

  async _onLatestBlock(blockNumber) {
    log('_onLatestBlock', blockNumber)
    try {
      await this.pendingTxTracker.updatePendingTxs()
    } catch (err) {
      log(err)
    }
  }

  _failTransaction(txId, error) {
    this.txStateManager.setTxStatusFailed(txId, error)
  }

  /**
   * Sets the status of the transaction to confirmed and sets the status of nonce duplicates as
   * dropped if the txParams have data it will fetch the txReceipt
   *
   * @param {number} txId - The tx's ID
   * @param txReceipt
   * @param baseFeePerGas
   * @param blockTimestamp
   * @returns {Promise<void>}
   */
  _confirmTransaction(txId, txReceipt, baseFeePerGas, blockTimestamp) {
    // get the txReceipt before marking the transaction confirmed
    // to ensure the receipt is gotten before the ui revives the tx
    const txMeta = this.txStateManager.getTransaction(txId)

    if (!txMeta) {
      return
    }

    try {
      const gasUsed = txReceipt.gasUsed
      txMeta.txReceipt = {
        ...txReceipt,
        gasUsed
      }
      if (baseFeePerGas) {
        txMeta.baseFeePerGas = baseFeePerGas
      }
      if (blockTimestamp) {
        txMeta.blockTimestamp = blockTimestamp
      }
      txMeta.status = CONFIRMED
      this.txStateManager.updateTransaction(txMeta)
    } catch (error) {}
  }
}
