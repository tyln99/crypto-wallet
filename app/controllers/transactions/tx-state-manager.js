import SafeEventEmitter from 'safe-event-emitter'
import ObservableStore from '@shared/util/obs-store'
import { TRANSACTION_STATUSES } from '@shared/constant/app'
import { orderBy, pickBy } from 'lodash'
import { log } from '@shared/util/logger'
import { v4 as uuidv4 } from 'uuid'
import { utils } from 'web3'
import TransactionStoreManager from './tx-store-manager'

const { PENDING, CONFIRMED, FAILED } = TRANSACTION_STATUSES

export default class TransactionStateManager extends SafeEventEmitter {
  constructor(opts) {
    super(opts)
    this.store = new ObservableStore({ transactions: opts.initData })
    this.txDataStore = new TransactionStoreManager()
    this.getNetwork = opts.getNetwork
  }

  /**
   * Updated 'transactions state' after 'transactions' is migrated from 'activities'
   */
  async updateInitialTransactions() {
    const tx = await this.txDataStore.updateInitialTransactions()
    this.store.updateState({
      transactions: tx
    })
    return tx
  }

  /**
   * Get all pending transactions for the current network. If an address is
   * provided, the list will be further refined to only those transactions
   * originating from the supplied address.
   *
   * @param {string} [address] - hex prefixed address to find transactions for.
   * @returns {TransactionMeta[]} the filtered list of transactions
   */
  getPendingTransactions(address) {
    const searchCriteria = { status: PENDING }
    if (address) {
      searchCriteria.from = address
    }
    return this.searchTransactions(searchCriteria)
  }

  getTransactions({ address, toAddr }) {
    // const searchCriteria = { status: TRANSACTION_STATUSES.SUBMITTED }
    const searchCriteria = {}
    if (address) {
      searchCriteria.from = address
    }
    if (toAddr) {
      searchCriteria.to = toAddr
    }
    return this.searchTransactions(searchCriteria)
  }

  /**
   * @param {number} txId
   * @returns {TransactionMeta} the txMeta who matches the given id if none found
   * for the network returns undefined
   */
  getTransaction(txId) {
    const { transactions } = this.store.getState()
    return transactions[txId]
  }

  searchTransactions(searchCriteria = {}) {
    log('get transactions', searchCriteria)
    const chainId = this.getNetwork().chainId
    const transactionsToFilter = this.store.getState().transactions

    // Combine sortBy and pickBy to transform our state object into an array of
    // matching transactions that are sorted by time.
    const filteredTransactions = orderBy(
      pickBy(transactionsToFilter, (transaction) => {
        if (transaction.chainId !== utils.toHex(chainId)) {
          return false
        }
        for (const [key, value] of Object.entries(searchCriteria)) {
          log('filter by key, value', key, value)
          if (key in transaction) {
            if (transaction[key] !== value) {
              return false
            }
          }
        }
        return true
      }),
      'time',
      'desc'
    )

    log('filteredTransactions', filteredTransactions)
    return filteredTransactions
  }

  addTransaction(txMeta) {
    // txMeta = normalize...
    this._addTransactionsToState([txMeta])
    return txMeta
  }

  generateTxMeta(txParams = {}) {
    const network = this.getNetwork()
    return {
      ...txParams,
      id: uuidv4(),
      chainId: utils.toHex(network.chainId),
      time: new Date().getTime()
    }
  }

  /**
   * updates the txMeta in the list and adds a history entry
   *
   * @param {Object} txMeta - the txMeta to update
   */
  updateTransaction(txMeta) {
    const txId = txMeta.id
    this.store.updateState({
      transactions: {
        ...this.store.getState().transactions,
        [txId]: txMeta
      }
    })
    this.emit('tx:status-update', txId, txMeta)
    this._storeTxToLocal(txMeta)
  }

  /**
   * Update status of the TransactionMeta with provided id to 'failed' and put
   * the error on the TransactionMeta object.
   *
   * @param {number} txId - the target TransactionMeta's Id
   * @param {Error} err - error object
   */
  setTxStatusFailed(txId, err) {
    const error = err || new Error('Internal zwallet failure')

    const txMeta = this.getTransaction(txId)
    txMeta.err = {
      message: error.message?.toString() || error.toString(),
      rpc: error.value,
      stack: error.stack
    }
    txMeta.status = FAILED
    this.updateTransaction(txMeta)
  }

  //
  // PRIVATE METHODS
  //

  /**
   * Store tx with status 'confirmed' or 'failed' to localStorage
   *
   * @param {*} txMeta - data to store
   */
  _storeTxToLocal(txMeta) {
    const status = txMeta.status
    if (status === CONFIRMED || status === FAILED) {
      this.txDataStore.addTransaction(txMeta)
    }
  }

  /**
   * Adds one or more transactions into state. This is not intended for
   * external use.
   *
   * @private
   * @param {TransactionMeta[]} transactions - the list of transactions to save
   */
  _addTransactionsToState(transactions) {
    this.store.updateState({
      transactions: transactions.reduce((result, newTx) => {
        result[newTx.id] = newTx
        return result
      }, this.store.getState().transactions)
    })
  }

  /**
   * removes multiple transaction from state. This is not intended for external use.
   *
   * @private
   * @param {number[]} targetTransactionIds - the transactions to delete
   */
  _deleteTransactions(targetTransactionIds) {
    const { transactions } = this.store.getState()
    targetTransactionIds.forEach((transactionId) => {
      delete transactions[transactionId]
    })
    this.store.updateState({
      transactions
    })
  }
}
