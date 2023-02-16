let accounts

// Dapp Status Section
const networkDiv = document.getElementById('network')
const chainIdDiv = document.getElementById('chainId')
const accountsDiv = document.getElementById('accounts')
const warningDiv = document.getElementById('warning')

// Basic Actions Section
const onboardButton = document.getElementById('connectButton')
const connectAccountsResult = document.getElementById('connectAccountsResult')
const getAccountsButton = document.getElementById('getAccounts')
const getAccountsResults = document.getElementById('getAccountsResult')

// Permissions Actions Section
const requestPermissionsButton = document.getElementById('requestPermissions')
const getPermissionsButton = document.getElementById('getPermissions')
const permissionsResult = document.getElementById('permissionsResult')

// Contract Section
const deployButton = document.getElementById('deployButton')
const depositButton = document.getElementById('depositButton')
const withdrawButton = document.getElementById('withdrawButton')
const contractStatus = document.getElementById('contractStatus')
const deployFailingButton = document.getElementById('deployFailingButton')
const sendFailingButton = document.getElementById('sendFailingButton')
const failingContractStatus = document.getElementById('failingContractStatus')

// Collectibles Section
const deployCollectiblesButton = document.getElementById('deployCollectiblesButton')
const mintButton = document.getElementById('mintButton')
const mintAmountInput = document.getElementById('mintAmountInput')
const approveTokenInput = document.getElementById('approveTokenInput')
const approveButton = document.getElementById('approveButton')
const setApprovalForAllButton = document.getElementById('setApprovalForAllButton')
const transferTokenInput = document.getElementById('transferTokenInput')
const transferFromButton = document.getElementById('transferFromButton')
const collectiblesStatus = document.getElementById('collectiblesStatus')

// Send Eth Section
const sendButton = document.getElementById('sendButton')
const sendResult = document.getElementById('sendResult')
const sendEIP1559Button = document.getElementById('sendEIP1559Button')

// Send Tokens Section
const decimalUnits = 4
const tokenSymbol = 'TST'
const tokenAddress = document.getElementById('tokenAddress')
const createToken = document.getElementById('createToken')
const watchAsset = document.getElementById('watchAsset')
const transferTokens = document.getElementById('transferTokens')
const transferTokensResult = document.getElementById('transferTokensResult')
const approveTokens = document.getElementById('approveTokens')
const transferTokensWithoutGas = document.getElementById('transferTokensWithoutGas')
const approveTokensWithoutGas = document.getElementById('approveTokensWithoutGas')

// Ethereum Signature Section
const ethSign = document.getElementById('ethSign')
const ethSignResult = document.getElementById('ethSignResult')
const personalSign = document.getElementById('personalSign')
const personalSignResult = document.getElementById('personalSignResult')
const personalSignVerify = document.getElementById('personalSignVerify')
const personalSignVerifySigUtilResult = document.getElementById('personalSignVerifySigUtilResult')
const personalSignVerifyECRecoverResult = document.getElementById(
  'personalSignVerifyECRecoverResult'
)
const signTypedData = document.getElementById('signTypedData')
const signTypedDataResult = document.getElementById('signTypedDataResult')
const signTypedDataVerify = document.getElementById('signTypedDataVerify')
const signTypedDataVerifyResult = document.getElementById('signTypedDataVerifyResult')
const signTypedDataV3 = document.getElementById('signTypedDataV3')
const signTypedDataV3Result = document.getElementById('signTypedDataV3Result')
const signTypedDataV3Verify = document.getElementById('signTypedDataV3Verify')
const signTypedDataV3VerifyResult = document.getElementById('signTypedDataV3VerifyResult')
const signTypedDataV4 = document.getElementById('signTypedDataV4')
const signTypedDataV4Result = document.getElementById('signTypedDataV4Result')
const signTypedDataV4Verify = document.getElementById('signTypedDataV4Verify')
const signTypedDataV4VerifyResult = document.getElementById('signTypedDataV4VerifyResult')

// Send form section
const fromDiv = document.getElementById('fromInput')
const toDiv = document.getElementById('toInput')
const type = document.getElementById('typeInput')
const amount = document.getElementById('amountInput')
const gasPrice = document.getElementById('gasInput')
const maxFee = document.getElementById('maxFeeInput')
const maxPriority = document.getElementById('maxPriorityFeeInput')
const data = document.getElementById('dataInput')
const gasPriceDiv = document.getElementById('gasPriceDiv')
const maxFeeDiv = document.getElementById('maxFeeDiv')
const maxPriorityDiv = document.getElementById('maxPriorityDiv')
const submitFormButton = document.getElementById('submitForm')

onboardButton.onclick = async () => {
  try {
    const newAccounts = await ethereum.request({
      method: 'eth_requestAccounts'
    })
    connectAccountsResult.innerHTML = newAccounts
    console.log(newAccounts)
    accounts = newAccounts
  } catch (error) {
    console.error(error)
    connectAccountsResult.innerHTML = `Error: ${error.message}`
  }
}

getAccountsButton.onclick = async () => {
  try {
    const _accounts = await ethereum.request({
      method: 'eth_accounts'
    })
    getAccountsResults.innerHTML = _accounts[0] || 'Not able to get accounts'
  } catch (err) {
    console.error(err)
    getAccountsResults.innerHTML = `Error: ${err.message}`
  }
}

/**
 * Permissions
 */

requestPermissionsButton.onclick = async () => {
  try {
    const permissionsArray = await ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    })
    console.log(permissionsArray)
    permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
  } catch (err) {
    console.error(err)
    permissionsResult.innerHTML = `Error: ${err.message}`
  }
}

getPermissionsButton.onclick = async () => {
  try {
    const permissionsArray = await ethereum.request({
      method: 'wallet_getPermissions'
    })
    console.log(permissionsArray)
    permissionsResult.innerHTML = getPermissionsDisplayString(permissionsArray)
  } catch (err) {
    console.error(err)
    permissionsResult.innerHTML = `Error: ${err.message}`
  }
}
/**
 * Sending ETH
 */

sendButton.onclick = async () => {
  try {
    const result = await ethereum.request({
      method: 'eth_sendTransaction',
      params: [
        {
          from: accounts[0],
          to: '0x0c54FcCd2e384b4BB6f2E405Bf5Cbc15a017AaFb',
          value: '0x0',
          gasLimit: '0x5028',
          gasPrice: '0x2540be400',
          type: '0x0'
        }
      ]
    })

    sendResult.innerHTML = result
    console.log(result)
  } catch (error) {
    console.log(error)
    sendResult.innerHTML = `Error: ${error.message}`
  }
}

/**
 * eth_sign
 */
ethSign.onclick = async () => {
  try {
    // const msg = 'Sample message to hash for signature'
    // const msgHash = keccak256(msg)
    const msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
    const ethResult = await ethereum.request({
      method: 'eth_sign',
      params: [accounts[0], msg]
    })
    ethSignResult.innerHTML = JSON.stringify(ethResult)
  } catch (error) {
    console.error(error)
    ethSignResult.innerHTML = `Error: ${error.message}`
  }
}

/**
 * Sending Token
 */
const web3 = new Web3(ethereum)

const hstContract = new web3.eth.Contract(zmpAbi, '0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4')

transferTokens.onclick = async () => {
  try {
    const sent = await hstContract.methods.mint().send({
      from: accounts[0],
      gas: '0x0',
      gasPrice: '0x0',
      value: '0x38D7EA4C68000'
    })
    transferTokensResult.innerHTML = sent
  } catch (error) {
    transferTokensResult.innerHTML = `Error: ${error.message}`
  }
}

// utils

function getPermissionsDisplayString(permissionsArray) {
  if (permissionsArray.length === 0) {
    return 'No permissions found.'
  }
  const permissionNames = permissionsArray.map((perm) => perm.parentCapability)
  return permissionNames.reduce((acc, name) => `${acc}${name}, `, '').replace(/, $/u, '')
}

ethereum.on('disconnect', (error) => console.error(error))
