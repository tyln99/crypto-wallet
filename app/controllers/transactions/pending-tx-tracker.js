import { log } from '@shared/util/logger'
import EthQuery from 'eth-query'
import SafeEventEmitter from 'safe-event-emitter'
import { HOUR } from '@shared/constant/time'

/**
 * @class
 */
export default class PendingTransactionTracker extends SafeEventEmitter {
  constructor(config) {
    super(config)
    this.query = config.query || new EthQuery(config.provider)
    this.getPendingTransactions = config.getPendingTransactions
  }

  /**
   * checks the network for signed txs and releases the nonce global lock if it is
   */
  async updatePendingTxs() {
    // in order to keep the nonceTracker accurate we block it while updating pending transactions
    // const nonceGlobalLock = await this.nonceTracker.getGlobalLock()
    try {
      const pendingTxs = this.getPendingTransactions()
      return await Promise.all(pendingTxs.map((txMeta) => this._checkPendingTx(txMeta)))
    } catch (err) {
      log('PendingTransactionTracker - Error updating pending transactions')
      log(err)
      return err
    }
    // nonceGlobalLock.releaseLock()
  }

  //
  // PRIVATE METHODS
  //

  async _checkPendingTx(txMeta) {
    log('_checkPendingTx')
    const txHash = txMeta.hash
    const txId = txMeta.id

    // extra check in case there was an uncaught error during the
    // signature and submission process
    if (!txHash) {
      const noTxHashErr = new Error(
        'We had an error while submitting this transaction, please try again.'
      )
      noTxHashErr.name = 'NoTxHashError'
      this.emit('tx:failed', txId, noTxHashErr)

      return { id: txId, error: noTxHashErr }
    }

    // if (await this._checkIfNonceIsTaken(txMeta)) {
    //   this.emit('tx:dropped', txId);
    //   return;
    // }

    try {
      const transactionReceipt = await this.query.getTransactionReceipt(txHash)
      if (transactionReceipt?.blockNumber) {
        const { baseFeePerGas, timestamp: blockTimestamp } = await this.query.getBlockByHash(
          transactionReceipt?.blockHash,
          false
        )

        this.emit('tx:confirmed', txId, transactionReceipt, baseFeePerGas, blockTimestamp)
        return { id: txId, result: transactionReceipt }
      }

      if (transactionReceipt === null) {
        const txStartTime = txMeta.time
        const current = new Date().getTime()
        if (current - txStartTime > 3 * HOUR) {
          //! fail tx if status is 'pending' over 3 hours
          const longPendingTxError = new Error(
            'We had an error while fetching pending tx, please try again.'
          )
          longPendingTxError.name = 'LongPendingTxError'
          this.emit('tx:failed', txId, longPendingTxError)
          return { id: txId, error: longPendingTxError }
        }
      }
    } catch (err) {
      txMeta.warning = {
        error: err.message,
        message: 'There was a problem loading this transaction.'
      }
      this.emit('tx:warning', txMeta, err)
      return { id: txId, error: err }
    }

    // if (await this._checkIfTxWasDropped(txMeta)) {
    //   this.emit('tx:dropped', txId);
    // }
  }
}
