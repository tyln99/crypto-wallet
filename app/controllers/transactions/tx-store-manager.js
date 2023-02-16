import ExtensionStore from '@app/scripts/lib/local-store'
import { STORAGE_KEYS } from '@shared/constant/app'

const { TRANSACTIONS } = STORAGE_KEYS

export default class TransactionStoreManager {
  constructor() {
    this.exStore = new ExtensionStore()
  }

  async addTransaction(txMeta) {
    const currData = (await this.exStore.get())[TRANSACTIONS]
    const txId = txMeta.id
    this.exStore.set({
      [TRANSACTIONS]: {
        ...currData,
        [txId]: txMeta
      }
    })
  }

  async updateInitialTransactions() {
    const txs = (await this.exStore.get())[TRANSACTIONS]
    return txs
  }
}
