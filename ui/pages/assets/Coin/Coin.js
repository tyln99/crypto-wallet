import React, { useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import 'bootstrap/dist/css/bootstrap.min.css'

import { selectedAccountSelector, selectedNetworkSelector } from '@selectors/common.selectors'
import Loader from '@components/Loader'
import { ZSendButton } from '@components/ZButtons'
import bnbLogo from '@resources/images/bnb.svg'
import ethLogo from '@resources/images/eth.svg'
import './Coin.scss'
import ActivityCard from '@components/ActivityCard'
import ZModal from '@components/ZModal'
import TransactionDetail from '@components/TransactionDetail'
import { formatAddress, formatBalance, stringCapitalize } from '@shared/util/string'
import useToast from '@hooks/useToast'
import * as actions from '@store/actions'
import { SEND_COIN_ROUTE } from '@shared/constant/routes'

function Coin() {
  const toast = useToast()
  const selectedAccount = useSelector(selectedAccountSelector)
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const history = useHistory()

  const [displayAccount, setDisplayAccount] = useState()
  const [activities, setActivities] = useState()
  const [showPreview, setShowPreview] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState()

  useEffect(() => {
    if (selectedAccount && selectedNetwork) {
      onGetAccountBalance(selectedAccount)
      onGetActivities()
    }
  }, [selectedAccount, selectedNetwork])

  const onGetAccountBalance = async (account) => {
    try {
      let balance = await actions.getBalance(account.address)
      account.balance = balance
      setDisplayAccount({ ...account })
    } catch (error) {
      const message = error.message || 'Something went wrong!'
      toast.error(message)
    }
  }

  const onGetActivities = async () => {
    try {
      const transactions = await actions.getTransactions({ address: selectedAccount.address })
      setActivities(transactions)
    } catch (error) {
      const message = error.message || 'Something went wrong!'
      toast.error(message)
    }
  }

  const getDisplayMethod = (activity) => {
    const { txDetails } = activity
    if (!txDetails || txDetails.type !== 'token') {
      return 'Send'
    } else {
      const { method, currency = '' } = txDetails
      return stringCapitalize(method) + ' ' + currency
    }
  }

  return (
    <div className="token-page">
      {!displayAccount && <Loader isActive={true} />}
      {displayAccount && (
        <div className="token-detail">
          <div className="navigation" onClick={() => history.goBack()}>
            <FontAwesomeIcon className="back-btn" icon={faAngleLeft} />
            &nbsp;
            {displayAccount.contactInfo ? (
              <span className="account-name">{displayAccount?.contactInfo?.name}</span>
            ) : (
              formatAddress(displayAccount.address)
            )}{' '}
            / {selectedNetwork.currency}
          </div>
          <div className="main">
            <div className="balance">
              <img
                className="icon"
                src={selectedNetwork.currency === 'BNB' ? bnbLogo : ethLogo}
                alt=""
              />
              <p className="balance-value">
                {formatBalance(displayAccount.balance, selectedNetwork.currency)}
              </p>
            </div>
            <Link to={SEND_COIN_ROUTE}>
              <ZSendButton text="Send" />
            </Link>
          </div>
          <div className="activities">
            {activities &&
              activities.map((item, index) => {
                return (
                  <ActivityCard
                    key={index}
                    activity={item}
                    networkCurrency={selectedNetwork.currency}
                    onClick={() => {
                      setShowPreview(true)
                      setSelectedActivity(item)
                    }}
                  />
                )
              })}
          </div>
        </div>
      )}

      {selectedActivity && (
        <ZModal
          show={showPreview}
          title={getDisplayMethod(selectedActivity)}
          onCancel={() => setShowPreview(false)}
          onSubmit={() => setShowPreview(false)}
          isShowControlButtons={false}
        >
          <TransactionDetail data={selectedActivity} />
        </ZModal>
      )}
    </div>
  )
}

export default Coin
