import React, { useEffect, useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { useHistory } from 'react-router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircle } from '@fortawesome/free-solid-svg-icons'
import { useTranslation } from 'react-i18next'

import {
  selectedAccountSelector,
  selectedNetworkSelector,
  dappOptionsSelector
} from '@selectors/common.selectors'
import Loader from '@components/Loader'
import ZTooltip from '@components/ZTooltip'
import { ZButton, ZIconButton } from '@components/ZButtons'
import ZModal from '@components/ZModal'
import TransactionDetail from '@components/TransactionDetail'
import { formatAddress, formatBalance, stringCapitalize } from '@shared/util/string'
import { setSelectedToken } from '@actions/creator'
import bnbLogo from '@resources/images/bnb.svg'
import ethLogo from '@resources/images/eth.svg'
import AccountSetting from '@components/AccountSetting'
import useToast from '@hooks/useToast'
import * as actions from '@store/actions'
import { log, logErr } from '@shared/util/logger'
import './Account.scss'
import Tabs from './Tabs'
import {
  COIN_ROUTE,
  CONNECT_ACCOUNT_ROUTE,
  SEND_COIN_ROUTE,
  TOKEN_ROUTE
} from '@shared/constant/routes'
import { useRouting } from '@ui/hooks/useRouting'
import copyIcon from '@resources/images/copy.svg'
import { getPermissionsFromStore } from '@shared/util/util'
import sendIcon from '@resources/images/send.svg'
import buyBtnIcon from '@resources/images/buy-btn.svg'
import { generateQRCode } from '@shared/util/qr.util'
import { BSC_TESTNET_CHAIN_ID, RINKEBY_CHAIN_ID, ROPSTEN_CHAIN_ID } from '@shared/constant/network'

export const TAB_KEYS = {
  ASSETS: 1,
  NFT: 2,
  ACTIVITIES: 3
}

function Account() {
  const selectedAccount = useSelector(selectedAccountSelector)
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const dAppOptions = useSelector(dappOptionsSelector)
  const { activeTab, data } = dAppOptions
  const routing = useRouting()
  const { t } = useTranslation()

  const history = useHistory()
  const dispatch = useDispatch()
  const toast = useToast()

  const [tokens, setTokens] = useState([])
  const [isCopied, setIsCopied] = useState(false)
  const [activities, setActivities] = useState()
  const [currentTab, setCurrentTab] = useState(1)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState()
  const [listNFTs, setListNFTS] = useState()
  const [isConnected, setIsConnected] = useState(false)
  const [connections, setConnections] = useState({})
  const [showConnectedSites, setShowConnectedSites] = useState(false)
  const [showConfirmDisconnectModal, setShowConfirmDisconnectModal] = useState(false)
  const [domainForDisconnect, setDomainForDisconnect] = useState()
  const [isShowBuyModal, setIsShowBuyModal] = useState(false)

  useEffect(() => {
    data && routing.detectRoute(data)
  }, [data])

  useEffect(() => {
    if (selectedNetwork && selectedAccount) {
      onGetActivities()
      onGetTokensDetails()
      onGetListNFTS()
    }
  }, [selectedAccount, selectedNetwork])

  useEffect(() => {
    selectedAccount && onCheckConnection()
  }, [selectedAccount])

  const onCheckConnection = async () => {
    try {
      let permissions = await actions.getPermissions()
      permissions = getPermissionsFromStore(permissions)
      setConnections(permissions)
      if (
        permissions[activeTab.origin] &&
        permissions[activeTab.origin].includes(selectedAccount.address)
      ) {
        setIsConnected(true)
      } else {
        setIsConnected(false)
      }
    } catch (error) {}
  }

  const onTabChange = async (value) => {
    setCurrentTab(parseInt(value))
  }

  const onGetActivities = async () => {
    if (currentTab === TAB_KEYS.ACTIVITIES) {
      try {
        const transactions = await actions.getTransactions({ address: selectedAccount.address })
        setActivities(transactions)
      } catch (error) {}
    }
  }

  const onGetListNFTS = async () => {
    if (selectedAccount && currentTab === TAB_KEYS.NFT) {
      try {
        const listNFTs = await actions.getListNFTS({ userAddr: selectedAccount.address })
        setListNFTS(listNFTs)
      } catch (error) {
        logErr({ error })
        const message = error.message || 'Something went wrong!'
        toast.error(message)
      }
    }
  }

  useEffect(() => {
    onGetActivities()
    onGetListNFTS()
  }, [currentTab])

  const onGetTokensDetails = async () => {
    try {
      const tokens = await actions.getListTokens(selectedNetwork.chainId, selectedAccount.address)
      const newListTokens = await Promise.all(
        Object.keys(tokens).map(async (key) => {
          const details = await actions.getTokenStandardAndDetails({
            tokenAddress: tokens[key].address,
            userAddress: selectedAccount.address
          })
          return details
        })
      )
      setTokens(newListTokens)
    } catch (error) {
      logErr({ error })
      toast.error(error)
    }
  }

  const copyAddress = () => {
    navigator.clipboard.writeText(selectedAccount.address)
    setIsCopied(!isCopied)
  }

  const onSelectTokenAsset = (token) => {
    dispatch(setSelectedToken(token))
    history.push(TOKEN_ROUTE)
  }

  const onSelectCoinAsset = () => {
    history.push(COIN_ROUTE)
  }

  const getDisplayMethod = (activity) => {
    const { txDetails } = activity
    if (!txDetails || txDetails.type !== 'token') {
      return t('Send')
    } else {
      const { method, currency = '' } = txDetails
      return stringCapitalize(method) + ' ' + currency
    }
  }

  const onDisconnect = async () => {
    log('onDisconnect')
    try {
      await actions.removePermission({ origin: domainForDisconnect })
      setShowConfirmDisconnectModal(false)
      onCheckConnection()
    } catch (error) {}
  }

  const openBuyModal = () => {
    setIsShowBuyModal(true)
  }

  return (
    <div className="account-page">
      {!selectedAccount && <Loader isActive={true} />}
      {selectedAccount && (
        <>
          <div className="main-info">
            <div className="account-options">
              <div className="box">
                <div className={`connection-status ${isConnected ? 'active' : ''}`}>
                  <FontAwesomeIcon
                    className={`icon ${isConnected ? 'active' : 'inactive'}`}
                    icon={faCircle}
                  />
                  &nbsp;
                  <span className="text">{isConnected ? t('Connected') : t('Not connected')}</span>
                </div>
              </div>
              <ZTooltip
                content={isCopied ? t('Copied') : t('Copy to clipboard')}
                onShow={() => {
                  setIsCopied(false)
                  return true
                }}
              >
                <div className="box account-info" onClick={copyAddress}>
                  <div className="account-name">{selectedAccount?.contactInfo?.name}</div>
                  <div className="address">
                    {formatAddress(selectedAccount.address)}
                    <img alt="" src={copyIcon} />
                  </div>
                </div>
              </ZTooltip>
              <div className="box">
                <span className="options">
                  <AccountSetting
                    showConnectedSites={() => setShowConnectedSites(true)}
                    onUnlock={actions.unlock}
                    network={selectedNetwork}
                    account={selectedAccount}
                  />
                </span>
              </div>
            </div>
            <div className="balance">
              <img
                className="currency-logo"
                src={selectedNetwork.currency === 'BNB' ? bnbLogo : ethLogo}
                alt=""
              />
              &nbsp;
              <p className="balance-value">
                {formatBalance(selectedAccount.balance || 0, selectedNetwork.currency)}
              </p>
            </div>
          </div>

          <div className="buttons">
            <Link to={SEND_COIN_ROUTE}>
              <ZIconButton text={t('SEND')} icon={sendIcon} />
            </Link>
            &nbsp;
            <ZIconButton onClick={openBuyModal} text={t('BUY')} icon={buyBtnIcon} />
          </div>

          <Tabs
            onTabChange={onTabChange}
            currentTab={currentTab}
            onSelectCoinAsset={onSelectCoinAsset}
            selectedNetwork={selectedNetwork}
            selectedAccount={selectedAccount}
            tokens={tokens}
            onSelectTokenAsset={onSelectTokenAsset}
            listNFTs={listNFTs}
            activities={activities}
            setShowPreview={setShowPreview}
            setSelectedActivity={setSelectedActivity}
          />
        </>
      )}

      {selectedActivity && (
        <ZModal
          show={showPreview}
          title={getDisplayMethod(selectedActivity)}
          onCancel={() => setShowPreview(false)}
          onSubmit={() => setShowPreview(false)}
          isShowControlButtons={false}
        >
          <TransactionDetail data={selectedActivity} networkCurrency={selectedNetwork.currency} />
        </ZModal>
      )}

      <ZModal
        className="connection-modal"
        show={showConnectedSites}
        title={t('Connected sites')}
        onCancel={() => setShowConnectedSites(false)}
        isShowControlButtons={false}
      >
        <>
          {connections &&
            Object.keys(connections).map((domain, index) => (
              <div className="connection-item" key={index}>
                <span>{domain}</span>
                <span
                  onClick={() => {
                    setShowConnectedSites(false)
                    setShowConfirmDisconnectModal(true)
                    setDomainForDisconnect(domain)
                  }}
                  className="disconnect-btn"
                >
                  {t('Disconnect')}
                </span>
              </div>
            ))}
          {!isConnected && activeTab.origin.includes('http') && (
            <div className="connect-account-link">
              <Link to={CONNECT_ACCOUNT_ROUTE}>{t('Manually connect to current site')}</Link>
            </div>
          )}
        </>
      </ZModal>

      <ZModal
        className="connection-modal"
        show={showConfirmDisconnectModal}
        title={`${t('Disconnect')} ${domainForDisconnect}`}
        onCancel={() => setShowConfirmDisconnectModal(false)}
        onSubmit={onDisconnect}
        okText={t('Confirm')}
      >
        <div>{t('Are you sure you want to disconnect? You may lose site functionality.')}</div>
      </ZModal>

      {selectedAccount && selectedNetwork && (
        <ZModal
          className="buy-modal"
          show={isShowBuyModal}
          title={`${t('Buy')} ${selectedNetwork.currency}`}
          onCancel={() => setIsShowBuyModal(false)}
          onSubmit={onDisconnect}
          isShowControlButtons={false}
        >
          <img alt="" src={generateQRCode(`ethereum:${selectedAccount.address}`, '240x240')} />
          <ZTooltip
            content={isCopied ? t('Copied') : t('Copy to clipboard')}
            onShow={() => {
              setIsCopied(false)
              return true
            }}
          >
            <div className="copy-box" onClick={copyAddress}>
              <p>{selectedAccount.address}</p>
              <img alt="" src={copyIcon} />
            </div>
          </ZTooltip>
          {selectedNetwork?.chainId === BSC_TESTNET_CHAIN_ID && (
            <ZButton
              className="buy-btn secondary"
              onClick={() => window.open(`https://testnet.binance.org/faucet-smart`, '_blank')}
            >
              {t('Add faucet')}
            </ZButton>
          )}
          {selectedNetwork?.chainId === RINKEBY_CHAIN_ID && (
            <ZButton
              className="buy-btn secondary"
              onClick={() => window.open(`https://faucet.rinkeby.io`, '_blank')}
            >
              {t('Add faucet')}
            </ZButton>
          )}
          {selectedNetwork?.chainId === ROPSTEN_CHAIN_ID && (
            <ZButton
              className="buy-btn secondary"
              onClick={() => window.open(`https://faucet.egorfine.com`, '_blank')}
            >
              {t('Add faucet')}
            </ZButton>
          )}
        </ZModal>
      )}
    </div>
  )
}

export default Account
