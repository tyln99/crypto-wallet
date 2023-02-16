import { listAccountsSelector } from '@selectors/common.selectors'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import AccountCard from '@components/AccountCard'
import * as actions from '@store/actions'
import { logErr } from '@shared/util/logger'
import EditAccountNameForm from '@ui/components/Forms/EditAccountNameForm'
import { forEach } from 'lodash'
import { setListAccounts } from '@actions/creator'
import useToast from '@ui/hooks/useToast'
import './AccountSetting.scss'
import { useTranslation } from 'react-i18next'

function AccountSetting() {
  const listAccounts = useSelector(listAccountsSelector)
  const dispatch = useDispatch()
  const toast = useToast()
  const { t } = useTranslation()
  const [account, setAccount] = useState()

  const onSelectAccount = (acc) => {
    setAccount(acc)
  }

  const handleOnEdited = async ({ accountName }) => {
    try {
      await actions.addContact({ name: accountName.trim(), address: account.address })
      forEach(listAccounts, (value, index) => {
        if (value.address === account.address) {
          listAccounts[index].contactInfo = { name: accountName }
          return dispatch(setListAccounts([...listAccounts]))
        }
      })
    } catch (error) {
      logErr({ error, data: { accountName } })
      toast.error(error.message || t('Something went wrong!'))
    }
  }

  return (
    <div className="account-setting-content">
      <div className="account-setting-header">
        <h2>{t('Account')}</h2>
      </div>
      <main>
        <div className="account-list">
          {listAccounts &&
            listAccounts.map((item, index) => {
              const isSelected = item.address === account?.address

              return (
                <AccountCard
                  className={`${isSelected && 'selected'}`}
                  key={index}
                  onClick={() => onSelectAccount(item)}
                  balance={item.balance}
                  account={item}
                  isShowCheckbox={false}
                />
              )
            })}
        </div>
        {account && (
          <div className="edit-form">
            <h2 className="form-title">{t('Edit account name')}</h2>
            <EditAccountNameForm
              okText={t('Update')}
              cancelText={t('Reset')}
              initValues={{ accountName: account?.contactInfo?.name || '' }}
              onSubmit={handleOnEdited}
            />
          </div>
        )}
      </main>
    </div>
  )
}

export default AccountSetting
