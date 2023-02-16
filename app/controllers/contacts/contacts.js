import ExtensionStore from '@app/scripts/lib/local-store'
import { CONTACT_TYPE, STORAGE_KEYS } from '@shared/constant/app'
import { log } from '@shared/util/logger'
import { pickBy } from 'lodash'

/**
 * Manage contacts state
 * @class
 */
export class ContactsController {
  constructor() {
    this.extensionStore = new ExtensionStore()
  }

  /**
   * Create or edit name for account
   *
   * @param {*} name - nickname for this address
   * @returns {Promise<boolean>}
   */
  async addContact({ name, address, type = CONTACT_TYPE.INTERNAL }) {
    try {
      const data = await this.extensionStore.get()
      const names = data[STORAGE_KEYS.CONTACTS]
      this.extensionStore.set({
        [STORAGE_KEYS.CONTACTS]: {
          ...names,
          [address.toLowerCase()]: {
            name,
            address,
            type
          }
        }
      })
      return true
    } catch (error) {
      throw error
    }
  }

  /**
   * Get accounts identity
   *
   * @returns {Promise<Object>} Address mapping with name
   */
  async getContacts() {
    try {
      const data = await this.extensionStore.get()
      const contacts = data[STORAGE_KEYS.CONTACTS]
      return contacts
    } catch (error) {
      throw error
    }
  }

  /**
   * Init first contact
   */
  initContact = () => {
    const firstContact = {
      first: {
        name: 'Account 1'
      }
    }
    this.extensionStore.set({ [STORAGE_KEYS.CONTACTS]: firstContact })
    return firstContact
  }

  /**
   * Search contacts
   *
   * @param {*} searchCriteria
   * @returns {Promise<Array>} list searched contacts
   */
  async searchContacts(searchCriteria = {}) {
    const contacts = await this.getContacts()
    const filteredContacts = pickBy(contacts, (contact) => {
      for (const [key, value] of Object.entries(searchCriteria)) {
        log('filter by key, value', key, value)
        if (key in contact) {
          if (contact[key] !== value) {
            return false
          }
        } else {
          return false
        }
      }
      return true
    })
    log('filteredContacts', filteredContacts)
    return filteredContacts
  }

  /**
   * Clear names storage
   */
  async clearContacts() {
    try {
      return await this.extensionStore.set({ [STORAGE_KEYS.CONTACTS]: {} })
    } catch (error) {
      throw error
    }
  }
}
