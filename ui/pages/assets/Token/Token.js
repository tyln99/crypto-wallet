import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import {
  selectedTokenSelector,
  selectedAccountSelector,
  selectedNetworkSelector
} from '@selectors/common.selectors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Loader from '@components/Loader'
import logo from '@resources/images/logo.svg'
import { ZSendButton } from '@components/ZButtons'
import './styles.scss'
import ActivityCard from '@components/ActivityCard'
import ZModal from '@components/ZModal'
import TransactionDetail from '@components/TransactionDetail'
import { formatAddress, formatBalance, stringCapitalize } from '@shared/util/string'
import { log } from '@shared/util/logger'
import useToast from '@hooks/useToast'
import * as actions from '@store/actions'
import { SEND_TOKEN_ROUTE } from '@shared/constant/routes'
import { useTranslation } from 'react-i18next'

function Token() {
  const account = useSelector(selectedAccountSelector)
  const network = useSelector(selectedNetworkSelector)
  const token = useSelector(selectedTokenSelector)
  const history = useHistory()
  const toast = useToast()
  const { t } = useTranslation()

  const [tokenDetails, setTokenDetails] = useState()
  const [activities, setActivities] = useState()
  const [showPreview, setShowPreview] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState()

  useEffect(() => {
    if (token && account && network) {
      log(token)
      queryToken()
    }
  }, [token, account, network])

  const onGetActivities = async (tokenAddr) => {
    try {
      const transactions = await actions.getTransactions({
        address: account.address,
        toAddr: tokenAddr
      })
      setActivities(transactions)
    } catch (error) {
      const message = error.message || 'Something went wrong!'
      toast.error(message)
    }
  }

  const queryToken = async () => {
    if (account) {
      try {
        const result = await actions.getTokenStandardAndDetails({
          tokenAddress: token.address,
          userAddress: account.address
        })
        setTokenDetails(result)
        onGetActivities(result.address)
      } catch (error) {
        const message = error.message || 'Something went wrong!'
        toast.error(message)
        history.goBack()
      }
    }
  }

  const getDisplayMethod = (activity) => {
    const { txDetails } = activity
    log(!txDetails, txDetails.type !== 'token')
    if (!txDetails || txDetails.type !== 'token') {
      return t('Send')
    } else {
      const { method, currency = '' } = txDetails
      return stringCapitalize(method) + ' ' + currency
    }
  }

  return (
    <div className="token-page">
      {(!account || !tokenDetails) && <Loader isActive={true} />}
      {account && tokenDetails && (
        <div className="token-detail">
          <div className="navigation" onClick={() => history.goBack()}>
            <FontAwesomeIcon className="back-btn" icon={faAngleLeft} />
            &nbsp;
            {account.contactInfo ? (
              <span className="account-name">{account?.contactInfo?.name}</span>
            ) : (
              formatAddress(account.address)
            )}{' '}
            / {tokenDetails.symbol}
          </div>
          <div className="main">
            <div className="balance">
              <img className="icon" src={logo} alt="" />
              <p className="balance-value">
                {formatBalance(tokenDetails.balance, tokenDetails.symbol)}
              </p>
            </div>
            <Link to={SEND_TOKEN_ROUTE}>
              <ZSendButton text={t('Send')} />
            </Link>
          </div>
          <div className="activities">
            {activities &&
              activities.map((item, index) => {
                return (
                  <ActivityCard
                    key={index}
                    activity={item}
                    networkCurrency={network.currency}
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

export default Token
