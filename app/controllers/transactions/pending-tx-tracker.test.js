const { logWarn } = require('@shared/util/logger')
const EthQuery = require('eth-query')
const SafeEventEmitter = require('safe-event-emitter')
const {
  MOCK_TX_HASH,
  MOCK_TX,
  MOCK_INVALID_TX,
  MOCK_NULL_TX_RECEIPT
} = require('../../../test/mocks/tx')
const { default: PendingTransactionTracker } = require('./pending-tx-tracker')

jest.mock('safe-event-emitter')
jest.mock('eth-query', () => {
  return jest.fn().mockImplementation(() => {
    return {
      getTransactionReceipt: (hash) => {
        if (hash === MOCK_TX_HASH) {
          return MOCK_TX
        }
        return null
      },
      getBlockByHash: () => ({ baseFeePerGas: '', timestamp: '' })
    }
  })
})

let pendingTxTracker
describe('PendingTransactionTracker', () => {
  beforeAll(() => {
    pendingTxTracker = new PendingTransactionTracker({
      getPendingTransactions: () => [MOCK_TX, MOCK_INVALID_TX, MOCK_NULL_TX_RECEIPT]
    })
  })

  describe('updatePendingTxs', () => {
    it('should return an array with two values', async () => {
      const rs = await pendingTxTracker.updatePendingTxs()
      expect(rs[0].result.hash).toBe(MOCK_TX_HASH)
      expect(rs[1].error.message).toBe(
        'We had an error while submitting this transaction, please try again.'
      )
      expect(rs[2].error.message).toBe(
        'We had an error while fetching pending tx, please try again.'
      )
    })

    it('should throw error while call getPendingTx', async () => {
      pendingTxTracker.getPendingTransactions = jest.fn().mockImplementation(() => {
        throw new Error('getPendingTransactions error')
      })
      const rs = await pendingTxTracker.updatePendingTxs()
      expect(rs.message).toBe('getPendingTransactions error')
    })
  })
})
