const { Transaction } = require('@ethereumjs/tx')
const { TRANSACTION_STATUSES } = require('@shared/constant/app')
const {
  MOCK_CHAIN_ID,
  customMockTx,
  MOCK_USER_ADDR,
  MOCK_TX_HASH,
  MOCK_NONCE,
  MOCK_PRIVATEKEY,
  MOCK_SIGNED_TX,
  MOCK_GAS_LIMIT
} = require('../../../test/mocks/tx')
const { TransactionController } = require('./transactions')
const { default: TransactionStateManager } = require('./tx-state-manager')

jest.mock('./tx-state-manager')
jest.mock('eth-query')
jest.mock('safe-event-emitter')
jest.mock('./pending-tx-tracker')
jest.mock('@shared/util/obs-store')
jest.mock('@ethereumjs/tx')

const mockTx = customMockTx({
  id: '01',
  from: MOCK_USER_ADDR,
  to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb',
  chainId: MOCK_CHAIN_ID,
  status: TRANSACTION_STATUSES.PENDING
})

let txController
describe('TransactionController', () => {
  beforeAll(() => {
    TransactionStateManager.mockImplementation(() => {
      return {
        addTransaction: () => {},
        updateInitialTransactions: () => {},
        getTransactions: () => {},
        on: (message, callback) => {
          callback()
        },
        getPendingTransactions: () => [mockTx]
      }
    })
    txController = new TransactionController({
      getNetwork: () => ({ chainId: MOCK_CHAIN_ID }),
      blockTracker: {
        on: (message, callback) => {
          callback()
        },
        removeEventListener: () => {}
      }
    })
    txController.promisifiedQuery = {
      getTransactionCount: () => MOCK_NONCE,
      sendRawTransaction: () => MOCK_TX_HASH
    }
    txController.txStateManager = {
      generateTxMeta: () => mockTx,
      addTransaction: () => {},
      setTxStatusFailed: () => {},
      updateTransaction: () => {},
      getTransaction: () => mockTx,
      on: (message, callback) => {
        callback()
      }
    }
    txController.query = {
      estimateGas: (params, callback) => {
        callback(null, MOCK_GAS_LIMIT)
      }
    }
  })

  describe('addTransaction', () => {
    it('should return nothing', () => {
      expect(() => txController.addTransaction()).not.toThrow()
    })
  })

  describe('sendTransaction', () => {
    beforeAll(() => {
      Transaction.mockImplementation(() => {
        return {
          sign: () => ({
            serialize: () => 'serializedTx'
          })
        }
      })
    })

    it('should return transactionHash', async () => {
      const tx = { ...mockTx, from: { privateKey: MOCK_PRIVATEKEY, address: MOCK_USER_ADDR } }
      const rs = await txController.sendTransaction(tx)
      expect(rs).toBe(MOCK_TX_HASH)
    })
  })

  describe('estimateGas', () => {
    it('should return estimated gas', async () => {
      const rs = await txController.estimateGas(mockTx)
      expect(rs).toBe(MOCK_GAS_LIMIT)
    })
  })
})
