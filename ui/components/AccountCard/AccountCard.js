import React, { useEffect, useState } from 'react'
import { AccountCardStyled } from './styled'
import bnbIcon from '@resources/images/bnb.svg'
import ethIcon from '@resources/images/eth.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'
import { compare, formatAddress, formatBalance } from '@shared/util/string'
import { ACCOUNT_TYPE } from '@shared/constant/app'
import { useSelector } from 'react-redux'
import { selectedNetworkSelector } from '@selectors/common.selectors'
import { selectedAccountSelector } from '@selectors/common.selectors'
import { logCount } from '@shared/util/logger'
import { useTranslation } from 'react-i18next'

const AccountCard = ({ account, onCheck, onUncheck, onClick, isShowCheckbox, ...props }) => {
  const network = useSelector(selectedNetworkSelector)
  const selectedAccount = useSelector(selectedAccountSelector)
  const { t } = useTranslation()

  const [selected, setSelected] = useState(false)

  useEffect(() => {
    // handle default check account
    if (selectedAccount && compare(selectedAccount?.address, account.address)) {
      setSelected(true)
      onCheck && onCheck(account)
    }
  }, [selectedAccount])

  const handleOnClick = () => {
    if (!isShowCheckbox) {
      // action in dropdown
      onClick(account)
    } else {
      // action in connect account page
      if (selected) {
        setSelected(false)
        onUncheck(account)
      } else {
        setSelected(true)
        onCheck(account)
      }
    }
  }

  const renderCurrencyLogo = () => {
    const src = compare(network?.currency, 'bnb') ? bnbIcon : ethIcon
    return <img alt="" src={src} className="avatar" />
  }

  const renderAccountType = () => {
    if (account.type === ACCOUNT_TYPE.IMPORTED) {
      return <div className="suffix">{t('Imported')}</div>
    }
    return <></>
  }

  // logCount(`AccountCard ${account.address} rerender`)

  return (
    <AccountCardStyled {...props} onClick={handleOnClick}>
      {selectedAccount && network && (
        <>
          {!isShowCheckbox && compare(selectedAccount.address, account.address) && (
            <FontAwesomeIcon className="account-activated" icon={faCheck} />
          )}
          {isShowCheckbox && <input type="checkbox" checked={selected} onChange={null} readOnly />}
          {renderCurrencyLogo()}
          <div className="info">
            <p className={`name`}>{formatAddress(account?.contactInfo?.name || account.address)}</p>
            <p className="balance">{formatBalance(account.balance || 0, network.currency)}</p>
          </div>
          {renderAccountType()}
        </>
      )}
    </AccountCardStyled>
  )
}

export default React.memo(AccountCard)
