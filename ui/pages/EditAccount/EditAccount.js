import React from 'react'
import { useHistory } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import { selectedAccountSelector, listAccountsSelector } from '@selectors/common.selectors'
import { setListAccounts, setSelectedAccount } from '@actions/creator'
import EditAccountNameForm from '@components/Forms/EditAccountNameForm'
import './EditAccount.scss'
import * as actions from '@store/actions'
import useToast from '@hooks/useToast'
import { logErr } from '@shared/util/logger'
import { forEach } from 'lodash'
import { useTranslation } from 'react-i18next'

function EditAccount() {
  const selectedAccount = useSelector(selectedAccountSelector)
  const listAccounts = useSelector(listAccountsSelector)
  const history = useHistory()
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation()

  const handleOnEdited = async ({ accountName }) => {
    try {
      await actions.addContact({ name: accountName.trim(), address: selectedAccount.address })
      selectedAccount.contactInfo = {
        name: accountName
      }
      dispatch(setSelectedAccount(selectedAccount))
      updateListAccountsName(accountName)
      history.goBack()
    } catch (error) {
      logErr({ error, data: { accountName } })
      toast.error(error.message || 'Something went wrong!')
    }
  }

  const updateListAccountsName = (newName) => {
    forEach(listAccounts, (value, index) => {
      if (value.address === selectedAccount.address) {
        listAccounts[index].contactInfo = {
          name: newName
        }
        return dispatch(setListAccounts([...listAccounts]))
      }
    })
  }

  return (
    <div className="edit-account-page">
      <h2 className="title">{t('Edit account')}</h2>
      {selectedAccount && (
        <EditAccountNameForm
          okText={t('Update')}
          initValues={{ accountName: selectedAccount?.contactInfo?.name || '' }}
          onSubmit={handleOnEdited}
          onCancel={history.goBack}
        />
      )}
    </div>
  )
}

export default EditAccount
