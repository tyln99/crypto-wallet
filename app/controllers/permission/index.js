import ExtensionStore from '@app/scripts/lib/local-store'
import { STORAGE_KEYS } from '@shared/constant/app'
import { forOwn, isEmpty, omit } from 'lodash'
import { v4 as generateUid } from 'uuid'

/**
 * @class
 */
export default class PermissionController {
  constructor() {
    this.store = new ExtensionStore()
  }

  /**
   * wallet_requestAccounts
   * Add {origin: accounts} to connections storage
   *
   * @param {*} origin - domain for add connection
   * @param {*} accounts - list accounts for allow 'origin' call write transactions
   * @returns {Promise<Object>} Permission object that contain addresses per domain
   */
  async requestPermissions({ origin, accounts }) {
    const pm = this._generatePermissionMeta({ origin, accounts })
    const storePm = (await this.store.get())[STORAGE_KEYS.PERMISSION_CONTROLLER] || {}
    const subjects = storePm.subjects
    storePm.subjects = { ...subjects, ...pm }
    await this.store.set({ [STORAGE_KEYS.PERMISSION_CONTROLLER]: storePm })
    return pm
  }

  /**
   * Remove a domain permission
   *
   * @param {*} { origin } domain for remove permission
   * @returns {Promise<boolean>} is success
   */
  async removePermission({ origin }) {
    const storePm = (await this.store.get())[STORAGE_KEYS.PERMISSION_CONTROLLER]
    storePm.subjects = omit(storePm.subjects, [origin])
    await this.store.set({ [STORAGE_KEYS.PERMISSION_CONTROLLER]: storePm })
    return true
  }

  /**
   * Get list permissions
   *
   * @returns {Promise<Array>} list of permissions
   */
  async getPermissions() {
    const storePm = (await this.store.get())[STORAGE_KEYS.PERMISSION_CONTROLLER]
    return isEmpty(storePm.subjects) ? {} : storePm.subjects
  }

  /**
   * Get list permission of domain
   *
   * @returns {Promise<Object>} Permission
   */
  async getPermission({ origin }) {
    const storePm = (await this.store.get())[STORAGE_KEYS.PERMISSION_CONTROLLER]
    return isEmpty(storePm.subjects) ? {} : storePm.subjects[origin] || {}
  }

  _generatePermissionMeta({ origin, accounts }) {
    const permissions = {
      [origin]: {
        origin: origin,
        permissions: {
          eth_accounts: {
            caveats: [
              {
                type: 'restrictReturnedAccounts',
                value: this._filterAddresses(accounts)
              }
            ],
            date: new Date().getTime(),
            id: generateUid(),
            invoker: origin,
            parentCapability: 'eth_accounts'
          }
        }
      }
    }
    return permissions
  }

  _filterAddresses(accounts) {
    const addresses = []
    forOwn(accounts, function(_, key) {
      addresses.push(key)
    })
    return addresses
  }
}
