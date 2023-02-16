const { default: ExtensionStore } = require('@app/scripts/lib/local-store')
const { STORAGE_KEYS } = require('@shared/constant/app')
const { ContactsController } = require('.')
jest.mock('@app/scripts/lib/local-store')

describe('ContactsController', () => {
  const nonce = () => null
  let contactsController

  beforeEach(() => {
    ExtensionStore.mockImplementation(() => {
      return {
        set: nonce,
        get: jest.fn(() => Promise.resolve({ [STORAGE_KEYS.CONTACTS]: 'names' }))
      }
    })
    contactsController = new ContactsController()
  })

  describe('addContact', () => {
    it('should return true', async () => {
      await expect(
        contactsController.addContact({ name: 'Account 2', address: 'address2' })
      ).resolves.toBe(true)
    })
  })

  describe('getContacts', () => {
    it('should return list address mapping name', async () => {
      contactsController.extensionStore = new ExtensionStore()
      await expect(contactsController.getContacts()).resolves.toEqual({
        first: { name: 'Account 1' }
      })
    })
  })

  describe('clearContacts', () => {
    it('should return list address mapping name', async () => {
      contactsController.extensionStore = new ExtensionStore()
      expect(() => contactsController.clearContacts()).not.toThrow()
    })
  })
})
