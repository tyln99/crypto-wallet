import React from 'react'
import { useHistory } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'

import { listAccountsSelector } from '@selectors/common.selectors'
import { setListAccounts, setSelectedAccount } from '@actions/creator'
import { logErr, logWarn } from '@shared/util/logger'
import * as actions from '@store/actions'
import createIcon from '@resources/images/create-wallet.svg'
import './CreateAccount.scss'
import EditAccountNameForm from '@components/Forms/EditAccountNameForm'
import useToast from '@hooks/useToast'
import { useTranslation } from 'react-i18next'

function CreateAccount() {
  const history = useHistory()
  const dispatch = useDispatch()
  const toast = useToast()
  const listAccounts = useSelector(listAccountsSelector)
  const { t } = useTranslation()

  const handleOnCreate = async ({ accountName }) => {
    try {
      await actions.addAccount()
    } catch (error) {
      logWarn(error)
      return toast.error(error.message || 'Something went wrong!')
    }

    try {
      const accounts = await actions.getWallet()
      const account = accounts[accounts.length - 1]
      account.contactInfo = { name: accountName }
      listAccounts.unshift(account)
      dispatch(setSelectedAccount(account))
      dispatch(setListAccounts(listAccounts))
      actions.updateZWalletState({ selectedAddress: account.address })
      await actions.addContact({ name: accountName.trim(), address: account.address })
      history.goBack()
    } catch (error) {
      logErr({ error, data: { accountName } })
      toast.error(error.message || 'Something went wrong!')
    }
  }

  return (
    <div className="create-account-page">
      <div className="icon">
        <img alt="" src={createIcon} />
      </div>
      <h2 className="title">{t('Create account')}</h2>

      <EditAccountNameForm
        okText={t('Create')}
        onSubmit={handleOnCreate}
        onCancel={history.goBack}
      />
    </div>
  )
}

export default CreateAccount
