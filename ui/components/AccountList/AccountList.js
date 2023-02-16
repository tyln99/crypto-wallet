import { log, logCount } from '@shared/util/logger'
import React, { useCallback, useEffect, useState } from 'react'
import AccountCard from '../AccountCard'
import './AccountList.scss'

function AccountList({ accounts, isShowCheckbox, selectedListChange }) {
  const [selectedList, setSelectedList] = useState({})

  const handleOnCheck = useCallback((account) => {
    log('handleOnCheck', account)
    setSelectedList((prev) => {
      return {
        ...prev,
        [account.address]: account
      }
    })
  }, [])

  const handleOnUncheck = useCallback((account) => {
    const newList = selectedList
    delete newList[account.address]
    setSelectedList((prev) => {
      delete prev[account.address]
      return { ...prev }
    })
  }, [])

  useEffect(() => {
    selectedListChange(selectedList)
  }, [selectedList])

  logCount('AccountList rerender')

  return (
    <div className="account-list">
      {accounts &&
        accounts.map((account, index) => {
          return (
            <AccountCard
              onCheck={handleOnCheck}
              onUncheck={handleOnUncheck}
              key={index}
              account={account}
              isShowCheckbox={isShowCheckbox}
            />
          )
        })}
    </div>
  )
}

export default React.memo(AccountList)
