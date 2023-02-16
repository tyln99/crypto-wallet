import React, { useEffect, useState } from 'react'
import './ContactSetting.scss'
import * as actions from '@store/actions'
import { compare, formatAddress } from '@shared/util/string'
import ContactForm from '@ui/components/Forms/ContactForm'
import ZModal from '@ui/components/ZModal'
import { ZButton } from '@ui/components/ZButtons'
import useToast from '@hooks/useToast'
import { logErr } from '@shared/util/logger'
import { CONTACT_TYPE } from '@shared/constant/app'
import { useTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import Loader from '@ui/components/Loader'
import { useSelector } from 'react-redux'
import { listAccountsSelector } from '@selectors/common.selectors'

function ContactSetting() {
  const [contacts, setContacts] = useState()
  const [selectedContact, setSelectedContact] = useState()
  const [isShowCreateForm, setIsShowCreateForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const { t } = useTranslation()
  const listAccounts = useSelector(listAccountsSelector)

  useEffect(() => {
    fetchContacts()
  }, [])

  const fetchContacts = async () => {
    try {
      const rs = await actions.searchContacts({ type: CONTACT_TYPE.EXTERNAL })
      setContacts(rs)
    } catch (error) {}
  }

  // const handleOnEdit = async ({ accountName, address }) => {
  //   try {
  //     await actions.addContact({
  //       name: accountName.trim(),
  //       address: address.trim(),
  //       type: CONTACT_TYPE.EXTERNAL
  //     })
  //     await fetchContacts()
  //     closeModal()
  //   } catch (error) {
  //     logErr(error)
  //     toast.error(error.message || 'Something went wrong!')
  //   }
  // }

  const handleContactFormSubmit = async ({ accountName, address }) => {
    setLoading(true)
    try {
      if (checkAddressExistInWallet(address)) {
        throw new Error(t(`This address's already exists in your wallet`))
      }
      await actions.addContact({
        name: accountName.trim(),
        address: address.trim(),
        type: CONTACT_TYPE.EXTERNAL
      })
      await fetchContacts()
      closeModal()
    } catch (error) {
      closeModal()
      logErr({ error, data: { accountName, address } })
      toast.error(t(error.message) || t('Something went wrong!'))
    }
    setLoading(false)
  }

  const checkAddressExistInWallet = (address) => {
    for (let i = 0; i < listAccounts.length; i++) {
      if (compare(listAccounts[i].address, address)) {
        return true
      }
    }
    return false
  }

  const closeModal = () => {
    setIsShowCreateForm(false)
  }

  return (
    <div className="contact-setting-content">
      <Loader isActive={loading} />
      <div className="contact-setting-header">
        <h2>{t('Contact')}</h2>
        <ZButton onClick={() => setIsShowCreateForm(true)}>{t('Create')}</ZButton>
      </div>
      <main>
        <div className="contact-list">
          {contacts && !isEmpty(contacts) ? (
            Object.keys(contacts).map((address, index) => {
              return (
                <div
                  className={`contact-card ${address === selectedContact?.address?.toLowerCase() &&
                    'active'}`}
                  key={index}
                  onClick={() => setSelectedContact(contacts[address])}
                >
                  <h2 className="name">{contacts[address].name}</h2>
                  <p className="address">{formatAddress(address)}</p>
                </div>
              )
            })
          ) : (
            <p>{t('Your contact is empty')}</p>
          )}
        </div>
        <div className="contact-form">
          {selectedContact && (
            <>
              <h2 className="form-title">{t('Edit contact')}</h2>
              <ContactForm
                okText={t('Update')}
                cancelText={t('Reset')}
                initValues={{ accountName: selectedContact.name, address: selectedContact.address }}
                onSubmit={handleContactFormSubmit}
              />
            </>
          )}
        </div>
      </main>

      <ZModal
        title={t('Add new contact')}
        onCancel={closeModal}
        show={isShowCreateForm}
        isShowControlButtons={false}
      >
        <ContactForm
          okText={t('Create')}
          cancelText={t('Cancel')}
          onCancel={closeModal}
          onSubmit={handleContactFormSubmit}
        />
      </ZModal>
    </div>
  )
}

export default ContactSetting
