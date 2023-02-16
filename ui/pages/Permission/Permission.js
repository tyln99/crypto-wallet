import React, { useEffect, useState } from 'react'
import { Form, OverlayTrigger, Tooltip } from 'react-bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import { useSelector } from 'react-redux'
import {
  selectedAccountSelector,
  selectedNetworkSelector,
  dappOptionsSelector
} from '@selectors/common.selectors'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faTag, faUser } from '@fortawesome/free-solid-svg-icons'
import Loader from '@components/Loader'
import { ZFormButton } from '@components/ZButtons'
import './styles.scss'
import { toWei } from '@shared/util/converter'
import { formatAddress } from '@shared/util/string'
import { log } from '@shared/util/logger'

/**
 * @deprecated
 */
function Permission() {
  const [isLoading, setIsLoading] = useState(false)
  // const [account, setAccount] = useState()
  const [gasLimit, setGasLimit] = useState(21000)
  const [gasPrice, setGasPrice] = useState(10)
  const [tokenDetails, setTokenDetails] = useState()
  const [errorMessage, setErrorMessage] = useState()
  const selectedAccount = useSelector(selectedAccountSelector)
  const selectedNetwork = useSelector(selectedNetworkSelector)
  const dAppOptions = useSelector(dappOptionsSelector)
  const { zEvent, sender, data } = dAppOptions
  const {
    tokensController,
    // approve,
    // estimateGas,
    closePopup,
    notifyWebPage
  } = (zEvent && zEvent.getState()) || {}
  const { params: permissionInfo } = data || {}

  useEffect(() => {
    if (!sender || !permissionInfo || !permissionInfo.contract || !permissionInfo.amount) {
      log('Permission info is invalid')
      closePopup()
    }
  }, [])

  const onGetTokenInfo = async (contractAddress, fromAddress) => {
    var { result: details, error } = await tokensController.getTokenStandardAndDetails(
      contractAddress,
      fromAddress
    )
    setTokenDetails(details)
  }

  useEffect(() => {
    if (selectedAccount) {
      onGetTokenInfo(permissionInfo.contract, selectedAccount.address)
    }
  }, [selectedAccount])

  useEffect(() => {
    if (tokenDetails) {
      log('tokenDetails', tokenDetails)
      onEstimateGas()
    }
  }, [tokenDetails])

  const onEstimateGas = async () => {
    try {
      // setIsLoading(true)
      // const value =
      //   tokenDetails.standard === TOKEN_STANDARDS.ERC20
      //     ? web3.utils.toWei(`${permissionInfo.amount}`, UNITS.ETHER)
      //     : permissionInfo.amount

      // log('value', value)

      // const { result: gas } = await tokensController.estimateGas(
      //   tokenDetails.standard,
      //   permissionInfo.contract,
      //   CONTRACT_METHODS.transfer, // TODO: change to approve
      //   {
      //     from: selectedAccount.address,
      //     to: permissionInfo.contract,
      //     value: value
      //   }
      // )
      setGasLimit(50000)
      // setIsLoading(false)
    } catch (error) {
      log('error')
      setErrorMessage(error.message)
      setIsLoading(false)
    }
  }

  const onCancelRequestPermission = () => {
    closePopup()
  }

  const onConfirm = async () => {
    setIsLoading(true)
    const { result, error } = await tokensController.approve(
      tokenDetails.standard,
      permissionInfo.contract,
      selectedAccount,
      // permissionInfo.amount,
      toWei(permissionInfo.amount),
      gasLimit,
      1 // token id
    )
    log('result, error', result, error)

    if (error) {
      setErrorMessage(error.message)
    } else {
      notifyWebPage('approve_contract', { result })
      closePopup()
    }
    setIsLoading(false)
  }

  return (
    selectedNetwork &&
    selectedAccount && (
      <div className="permission-page">
        <Loader isActive={isLoading} />
        <header className="header">
          <span>{formatAddress(selectedAccount.address)}</span>
          <span>{selectedNetwork.name}</span>
        </header>
        <hr />
        <main>
          <section className="permission-intro">
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
            <div className="title">
              Allow {sender.origin} to spend your {tokenDetails?.symbol}?
            </div>
            <div className="info">
              <p className="description">
                By granting permission, you authorize the following contract to access your funds
              </p>
              <OverlayTrigger placement="bottom" overlay={<Tooltip>{'Copy to clipboard'}</Tooltip>}>
                <div
                  onClick={() => navigator.clipboard.writeText(selectedAccount.address)}
                  className="address-card"
                >
                  {formatAddress(permissionInfo.contract)}
                  {'  '}
                  <FontAwesomeIcon icon={faCopy} />
                </div>
              </OverlayTrigger>
            </div>
          </section>
          <hr />
          <section className="transaction-fee">
            <div className="title">
              <FontAwesomeIcon icon={faTag} />
              &nbsp;<h2>Transaction fee</h2>
            </div>
            <div className="info">
              This request comes with a fee:{' '}
              <span className="fw-bold">{gasLimit * gasPrice} GWei</span>
            </div>
          </section>
          <hr />
          {permissionInfo && (
            <section className="request-permission">
              <div className="title">
                <FontAwesomeIcon icon={faUser} />
                &nbsp;<h2>Request permission</h2>
              </div>
              <div className="info">
                <p>{sender.origin} can access and spend up to the maximum amount:</p>
                <p>
                  Approved amount:{' '}
                  <span className="fw-bold">
                    {permissionInfo.amount} {tokenDetails?.symbol}
                  </span>
                </p>
                <p>
                  For:{' '}
                  <span className="fw-bold">
                    Contract ({formatAddress(permissionInfo.contract)})
                  </span>
                </p>
              </div>
            </section>
          )}
          <hr />
          {/* <section className="data">
        <div className="title">
          <FontAwesomeIcon icon={faPaperclip} />
          &nbsp;<h2>Data</h2>
        </div>
        <div className="info">
          <p>Function: Approve</p>
          <p>Some hash data here</p>
        </div>
      </section> */}
          <hr />
          <Form.Group className="group-btn">
            <ZFormButton text="Cancel" variant="secondary" onClick={onCancelRequestPermission} />
            <ZFormButton
              text="Confirm"
              variant="primary"
              onClick={onConfirm}
              disabled={selectedAccount && tokenDetails ? false : true}
            />
          </Form.Group>
        </main>
      </div>
    )
  )
}

export default Permission
