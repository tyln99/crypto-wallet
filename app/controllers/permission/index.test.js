const { default: ExtensionStore } = require('@app/scripts/lib/local-store')
const { MOCK_USER_ADDR } = require('../../../test/mocks/tx')
const { default: PermissionController } = require('.')
const { STORAGE_KEYS } = require('@shared/constant/app')

jest.mock('@app/scripts/lib/local-store')
jest.mock('uuid')

describe('PermissionController', () => {
  let permissionController
  beforeEach(() => {
    ExtensionStore.mockImplementation(() => {
      return {
        set: () => Promise.resolve(),
        get: () =>
          Promise.resolve({
            [STORAGE_KEYS.PERMISSION_CONTROLLER]: {
              subjects: {
                'https://google.com': 'mock permissions'
              }
            }
          })
      }
    })
    permissionController = new PermissionController()
  })

  describe('requestPermissions', () => {
    it('should return new permission', async () => {
      const pm = await permissionController.requestPermissions({
        origin: 'https://google.com',
        accounts: {
          [MOCK_USER_ADDR]: {
            address: MOCK_USER_ADDR
          }
        }
      })
      expect(pm).toMatchObject({
        'https://google.com': {
          origin: 'https://google.com',
          permissions: {
            eth_accounts: {
              caveats: [
                {
                  type: 'restrictReturnedAccounts',
                  value: [MOCK_USER_ADDR]
                }
              ],
              invoker: 'https://google.com',
              parentCapability: 'eth_accounts'
            }
          }
        }
      })
    })
  })

  describe('removePermission', () => {
    it('should return list of permissions', async () => {
      const rs = await permissionController.removePermission({ origin: 'https://google.com' })
      expect(rs).toBe(true)
    })
  })

  describe('getPermissions', () => {
    it('should return list of permissions', async () => {
      const pms = await permissionController.getPermissions()
      expect(pms).toEqual({
        'https://google.com': 'mock permissions'
      })
    })
  })

  describe('getPermission', () => {
    it('should return list of permissions', async () => {
      const pms = await permissionController.getPermission({ origin: 'https://google.com' })
      expect(pms).toEqual('mock permissions')
    })
  })
})
