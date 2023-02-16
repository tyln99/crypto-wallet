const { NetworkController } = require('@app/controllers/network/network')
const { resolve } = require('@sentry/utils')
const { STORAGE_KEYS } = require('@shared/constant/app')
const { default: ObservableStore } = require('@shared/util/obs-store')
const { reject } = require('lodash')
const { MOCK_CHAIN_ID, MOCK_USER_ADDR, MOCK_PRIVATEKEY } = require('../../test/mocks/tx')
const { default: ExtensionStore } = require('./lib/local-store')
const { ZWalletController } = require('./zwallet-controller')
const { default: AppController } = require('@app/controllers/AppConroller')
const passworder = require('browser-passworder')
const bip39 = require('bip39')
const { hdkey } = require('ethereumjs-wallet')
const Web3 = require('web3')

jest.mock('./lib/extension')
jest.mock('@shared/util/obs-store')
jest.mock('@app/controllers/network/network')
jest.mock('json-rpc-engine')
jest.mock('./lib/local-store')
jest.mock('browser-passworder')
jest.mock('ethereumjs-wallet')
jest.mock('bip39')
jest.mock('@app/controllers/AppConroller')
jest.mock('web3')

describe('ZWalletController', () => {
  let walletController
  const nonce = () => null

  beforeEach(() => {
    ObservableStore.mockImplementation(() => {
      return {
        getState: () => ({
          chainId: MOCK_CHAIN_ID,
          selectedAddress: MOCK_USER_ADDR,
          isUnlocked: false,
          permissions: {}
        }),
        updateState: nonce
      }
    })
    NetworkController.mockImplementation(() => {
      return {
        initializeProvider: nonce,
        getProviderAndBlockTracker: () => ({}),
        getNetwork: () => ({ chainId: MOCK_CHAIN_ID }),
        addCustomNetwork: nonce,
        removeCustomNetwork: nonce,
        updateNetworkProvider: nonce
      }
    })
    ExtensionStore.mockImplementation(() => {
      return {
        set: nonce,
        get: jest.fn(() => Promise.resolve({ [STORAGE_KEYS.WALLET]: 'wallet' }))
      }
    })
    passworder.decrypt.mockImplementation((password, walllet) => {
      if (password === 'Password' && walllet === 'wallet') {
        return Promise.resolve({ tmp: 'decrypted wallet' })
      } else return Promise.reject(new Error('login failed'))
    })

    walletController = new ZWalletController({
      initState: {}
    })
    walletController.notifyAllConnections = nonce
  })

  describe('initializeProvider', () => {
    it('should not throw error', () => {
      expect(() => walletController.initializeProvider()).not.toThrow()
    })
  })

  describe('getProviderState', () => {
    it('should return wallet state', () => {
      var rs = walletController.getProviderState()
      expect(rs).toMatchObject({
        chainId: MOCK_CHAIN_ID,
        selectedAddress: MOCK_USER_ADDR
      })
    })
  })

  describe('unlock', () => {
    it('should throw wallet does not exists', async () => {
      ExtensionStore.mockImplementation(() => {
        return {
          set: nonce,
          get: jest.fn(() => Promise.resolve({}))
        }
      })
      walletController.extensionStore = new ExtensionStore()
      await expect(walletController.unlock()).rejects.toThrow()
    })

    it('should throw login fail', async () => {
      await expect(walletController.unlock('wrong pass')).rejects.toThrow()
    })

    it('should throw login success', async () => {
      await expect(walletController.unlock('Password')).resolves.toBe(true)
    })
  })

  describe('getWallet', () => {
    it('should throw error if wallet is not assigned', async () => {
      walletController.zwallet = null
      await expect(walletController.getWallet()).rejects.toThrow()
    })

    it('should return an array of accounts parsed from mnemonic', async () => {
      const mockHdWallet = {
        derivePath: () => ({
          getWallet: () => ({
            getAddress: () => MOCK_USER_ADDR,
            privateKey: MOCK_PRIVATEKEY,
            publicKey: 'public key'
          })
        })
      }
      bip39.mnemonicToSeed.mockResolvedValue('seed')
      hdkey.fromMasterSeed = () => mockHdWallet
      walletController.zwallet.setZWallet({ zwallet: { mnemonic: 'mnemonic', numberOfAccount: 2 } })
      walletController.contactsController.getContacts = () => Promise.resolve({})
      const accounts = await walletController.getWallet()
      expect(accounts.length).toBe(2)
      expect(accounts[0].balance).toBe(0)
      expect(accounts[0].publicKey).toBe('public key')
      expect(accounts[0].privateKey).toBe(MOCK_PRIVATEKEY)
    })
  })

  describe('addAccount', () => {
    it('throw wallet is locked', async () => {
      AppController.mockImplementation(() => {
        return {
          checkUnlocked: () => false
        }
      })
      walletController.appController = new AppController()
      await expect(walletController.addAccount()).rejects.toThrow()
    })

    it('return true', async () => {
      AppController.mockImplementation(() => {
        return {
          checkUnlocked: () => true
        }
      })
      walletController.appController = new AppController()
      walletController.zwallet.setZWallet({ password: 'Password' })
      await expect(walletController.addAccount()).resolves.toBe(true)
    })
  })

  describe('getImportedAccounts', () => {
    beforeAll(() => {})

    it('should return empty if storage has not have imported accounts', async () => {
      const rs = await walletController.getImportedAccounts()
      expect(rs).toEqual([])
    })

    it('should return list imported accounts', async () => {
      ExtensionStore.mockImplementation(() => {
        return {
          set: nonce,
          get: jest.fn(() => Promise.resolve({ [STORAGE_KEYS.IMPORTED_ACCOUNTS]: 'wallet' }))
        }
      })
      passworder.decrypt.mockImplementation((password, walllet) => {
        if (password === 'Password' && walllet === 'wallet') {
          return Promise.resolve([
            {
              address: 'account1'
            }
          ])
        } else return Promise.reject(new Error('login failed'))
      })
      walletController.zwallet.setZWallet({ password: 'Password' })
      walletController.extensionStore = new ExtensionStore()
      walletController.contactsController.getContacts = () => Promise.resolve({})
      const rs = await walletController.getImportedAccounts()
      expect(rs[0].address).toBe('account1')
    })
  })

  describe('importAccount', () => {
    beforeAll(() => {
      Web3.mockImplementation(() => {
        return {
          eth: {
            accounts: {
              privateKeyToAccount: (key) =>
                key === MOCK_PRIVATEKEY
                  ? {
                      address: MOCK_USER_ADDR,
                      privateKey: MOCK_PRIVATEKEY
                    }
                  : null
            }
          }
        }
      })
    })

    it('should throw invalid private key', async () => {
      await expect(walletController.importAccount()).rejects.toThrow('Private key is invalid')
    })

    it('should throw account already exists', async () => {
      walletController.getWallet = () =>
        Promise.resolve([
          {
            address: MOCK_USER_ADDR,
            privateKey: MOCK_PRIVATEKEY
          }
        ])

      walletController.getImportedAccounts = () => Promise.resolve([{ address: 'Import' }])
      await expect(walletController.importAccount(MOCK_PRIVATEKEY)).rejects.toThrow(
        'Account is already exists'
      )
    })

    it('should return imported account', async () => {
      walletController.getWallet = () => Promise.resolve([{ address: 'wallet' }])

      walletController.getImportedAccounts = () => Promise.resolve([{ address: 'Import' }])
      await expect(walletController.importAccount(MOCK_PRIVATEKEY)).resolves.toEqual({
        address: '0xc871a6abc90ceba7a626eea46e0c2936f2eb7293',
        privateKey: 'private key',
        type: 'Imported'
      })
    })
  })
})
