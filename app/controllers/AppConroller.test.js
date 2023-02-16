const { ZWallet } = require('@app/members/ZWallet')
const { default: ObservableStore } = require('@shared/util/obs-store')
const { default: AppController } = require('./AppConroller')
jest.mock('../../shared/util/obs-store')

describe('AppController', () => {
  let appController

  beforeEach(() => {
    ObservableStore.mockImplementation(() => {
      return {
        getState: () => ({
          isUnlocked: false,
          authenticate: {},
          zwallet: new ZWallet({ zwallet: {}, password: '' }),
          timeout: 0
        }),
        updateState: () => {}
      }
    })
    appController = new AppController({})
  })

  describe('setTimeOutForAppState', () => {
    it('should not throw error', () => {
      expect(() => appController.setTimeOutForAppState()).not.toThrow()
    })
  })

  describe('unlockKeyrings', () => {
    it('should update app password', () => {
      appController.unlockKeyrings('mypassword')
      expect(appController.password).toBe('mypassword')
    })
  })

  describe('setUnlocked', () => {
    it('should not throw erro', () => {
      expect(() => appController.setUnlocked()).not.toThrow()
    })
  })

  describe('setLocked', () => {
    it('should not throw erro', () => {
      expect(() => appController.setLocked()).not.toThrow()
    })
  })

  describe('checkUnlocked', () => {
    it('should not throw erro', () => {
      expect(appController.checkUnlocked()).toBe(false)
    })
  })
})
