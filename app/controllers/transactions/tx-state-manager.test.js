const { TRANSACTION_STATUSES } = require('@shared/constant/app')
const { logWarn } = require('@shared/util/logger')
const { MOCK_TX, MOCK_USER_ADDR, MOCK_CHAIN_ID, customMockTx } = require('../../../test/mocks/tx')
const { default: TransactionStateManager } = require('./tx-state-manager')

jest.mock('safe-event-emitter')
jest.mock('@shared/util/obs-store')
jest.mock('uuid', () => {
  return {
    v4: () => 'testid'
  }
})
jest.mock('./tx-store-manager', () => {
  return jest.fn().mockImplementation(() => {
    return {
      updateInitialTransactions: () => MOCK_TX,
      updateState: () => {},
      addTransaction: () => {}
    }
  })
})

let txStateManager

describe('TransactionStateManager', () => {
  beforeAll(() => {
    txStateManager = new TransactionStateManager({
      initData: {},
      getNetwork: () => ({ chainId: MOCK_CHAIN_ID })
    })
    txStateManager.store = {
      getState: () => ({
        transactions: {
          '01': customMockTx({
            id: '01',
            from: MOCK_USER_ADDR,
            to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb',
            chainId: MOCK_CHAIN_ID,
            status: TRANSACTION_STATUSES.PENDING
          }),
          '02': customMockTx({
            id: '02',
            from: MOCK_USER_ADDR,
            to: '0xb1d8fd0446335c9e9c1aa946b18fee878ff855a0',
            chainId: MOCK_CHAIN_ID,
            status: TRANSACTION_STATUSES.FAILED
          }),
          '03': customMockTx({
            id: '03',
            from: MOCK_USER_ADDR,
            to: '0xb1d8fd0446335c9e9c1aa946b18fee878ff855a0',
            chainId: '0x1',
            status: TRANSACTION_STATUSES.APPROVED
          })
        }
      }),
      updateState: () => {}
    }
  })

  describe('updateInitialTransactions', () => {
    it('should return tx', async () => {
      const tx = await txStateManager.updateInitialTransactions()
      expect(tx).toMatchObject(MOCK_TX)
    })
  })

  describe('getPendingTransactions', () => {
    it('should return pending transactions', async () => {
      var rs = await txStateManager.getPendingTransactions(MOCK_USER_ADDR)
      expect(rs[0].id).toBe('01')
      expect(rs[0].chainId).toBe(MOCK_CHAIN_ID)
      expect(rs[0].status).toBe(TRANSACTION_STATUSES.PENDING)
    })
  })

  describe('getTransactions', () => {
    it('should return transactions filter by FROM and TO', async () => {
      var rs = await txStateManager.getTransactions({
        address: MOCK_USER_ADDR,
        toAddr: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb'
      })
      expect(rs[0].id).toBe('01')
      expect(rs[0].chainId).toBe(MOCK_CHAIN_ID)
      expect(rs[0].from).toBe(MOCK_USER_ADDR)
      expect(rs[0].to).toBe('0x66aD13766007b509eeAD1E555dadC046DEC81dcb')
    })
  })

  describe('getTransaction', () => {
    it('should return transaction by txId', async () => {
      var rs = await txStateManager.getTransaction('01')
      expect(rs.id).toBe('01')
      expect(rs.chainId).toBe(MOCK_CHAIN_ID)
    })
  })

  describe('generateTxMeta', () => {
    it('should return generated tx meta', () => {
      const rs = txStateManager.generateTxMeta({ from: MOCK_USER_ADDR })
      expect(rs).toMatchObject({
        chainId: MOCK_CHAIN_ID,
        from: MOCK_USER_ADDR
      })
    })
  })

  describe('updateTransaction', () => {
    it('should return nothing', () => {
      expect(() => txStateManager.updateTransaction({})).not.toThrow()
    })
  })

  describe('setTxStatusFailed', () => {
    it('should return nothing', () => {
      expect(() => txStateManager.setTxStatusFailed('01', {})).not.toThrow()
    })
  })
})
