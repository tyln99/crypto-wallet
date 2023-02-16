import { log, logErr } from '@shared/util/logger'
import pify from 'pify'
import { utils } from 'web3'
import { fromWei, toWei } from '@shared/util/converter'
import { UNITS } from '@shared/constant/app'
import { getFourBytePrefix, getMethodDataAsync } from '@shared/util/transaction.util'
import { ETH_SYMBOL } from '@shared/constant/network'
import { v4 as uuidv4 } from 'uuid'

let background = null
let promisifiedBackground = null
export function setBackgroundConnection(backgroundConnection) {
  background = backgroundConnection
  promisifiedBackground = pify(background)

  backgroundConnection.onNotification((data) => {
    log('backgroundConnection.onNotification: ', data)
  })
}

export async function closePopup() {
  try {
    return await promisifiedBackground.closePopup()
  } catch (error) {
    logErr({ error, data: { method: 'closePopup' } })
    throw error
  }
}

export async function isNewMember() {
  try {
    return await promisifiedBackground.isNewMember()
  } catch (error) {
    logErr({ error, data: { method: 'isNewMember' } })
    throw error
  }
}

export async function isUnLocked() {
  try {
    return await promisifiedBackground.isUnlocked()
  } catch (error) {
    logErr({ error, data: { method: 'isUnLocked' } })
    throw error
  }
}

export async function unlock(password) {
  try {
    const rs = await promisifiedBackground.unlock(password)
    if (rs) {
      return true
    } else {
      throw new Error('Login failed')
    }
  } catch (error) {
    logErr({ error, data: { method: 'unlock' } })
    throw error
  }
}

export async function lock() {
  try {
    return await promisifiedBackground.lock()
  } catch (error) {
    logErr({ error, data: { method: 'lock' } })
    throw error
  }
}

export async function updateZWalletState(data) {
  try {
    return await promisifiedBackground.updateState(data)
  } catch (error) {
    logErr({ error, data: { method: 'updateZWalletState' } })
    throw error
  }
}

export async function getZWalletState() {
  try {
    return await promisifiedBackground.getState()
  } catch (error) {
    logErr({ error, data: { method: 'getZWalletState' } })
    throw error
  }
}

export async function getBalance(addr) {
  try {
    let balance = await promisifiedBackground.getBalance(addr)
    balance = utils.toBN(balance)
    return fromWei(balance)
  } catch (error) {
    logErr({ error, data: { method: 'getBalance', address: addr } })
    throw error
  }
}

export async function getMnemonic() {
  try {
    return await promisifiedBackground.getMnemonic()
  } catch (error) {
    logErr({ error, data: { method: 'getMnemonic' } })
    throw error
  }
}

export async function getWallet() {
  try {
    return await promisifiedBackground.getWallet()
  } catch (error) {
    logErr({ error, data: { method: 'getWallet' } })
    throw error
  }
}

export async function getImportedAccounts() {
  try {
    return await promisifiedBackground.getImportedAccounts()
  } catch (error) {
    logErr({ error, data: { method: 'getImportedAccounts' } })
    throw error
  }
}

export async function importAccount(privateKey) {
  try {
    return await promisifiedBackground.importAccount(privateKey)
  } catch (error) {
    logErr({ error, data: { method: 'importAccount' } })
    throw error
  }
}

export function addAccount() {
  try {
    return promisifiedBackground.addAccount()
  } catch (error) {
    logErr({ error, data: { method: 'addAccount' } })
    throw error
  }
}

export async function addContact({ name, address, type }) {
  if (!name) {
    throw new Error('Name cannot be empty')
  }
  if (!utils.isAddress(address)) {
    throw new Error('Address is not valid')
  }
  try {
    return await promisifiedBackground.addContact({ name, address, type })
  } catch (error) {
    logErr({ error, data: { method: 'addContact', name, address, type } })
    throw error
  }
}

export async function getContacts() {
  try {
    return await promisifiedBackground.getContacts()
  } catch (error) {
    logErr({ error, data: { method: 'getContacts' } })
    throw error
  }
}

export async function searchContacts(searchCriteria) {
  try {
    return await promisifiedBackground.searchContacts(searchCriteria)
  } catch (error) {
    logErr({ error, data: { method: 'searchContacts', searchCriteria } })
    throw error
  }
}

export async function getConnections(selAccAddress) {
  try {
    const connections = await promisifiedBackground.getConnections()
    const connectedDomains = []
    for (let domain in connections) {
      if (connections[domain].includes(selAccAddress)) {
        connectedDomains.push(domain)
      }
    }
    return connectedDomains
  } catch (error) {
    logErr({ error, data: { method: 'getConnections', selAccAddress } })
    throw error
  }
}

export async function getActivities(chainId, address, currency) {
  try {
    return await promisifiedBackground.getActivities(chainId, address, currency)
  } catch (error) {
    logErr({ error, data: { method: 'getActivities', chainId, address, currency } })
    throw error
  }
}

export async function getListNFTS({ userAddr }) {
  try {
    return await promisifiedBackground.getListNFTS(userAddr)
  } catch (error) {
    logErr({ error, data: { method: 'getListNFTS', userAddr } })
    throw error
  }
}

export async function getListTokens(chainId, userAddress) {
  try {
    return await promisifiedBackground.getListTokens(chainId, userAddress)
  } catch (error) {
    logErr({ error, data: { method: 'getListTokens', chainId, userAddress } })
    throw error
  }
}

// -------------------------------- Permission ----------------------------------- //
export async function requestPermissions({ origin, accounts }) {
  try {
    return await promisifiedBackground.requestPermissions({ origin, accounts })
  } catch (error) {
    logErr({ error, data: { method: 'requestPermissions', origin, accounts } })
    throw error
  }
}

export async function removePermission({ origin }) {
  try {
    return await promisifiedBackground.removePermission({ origin })
  } catch (error) {
    logErr({ error, data: { method: 'removePermission', origin } })
    throw error
  }
}

export async function getPermission({ origin }) {
  try {
    return await promisifiedBackground.getPermission({ origin })
  } catch (error) {
    logErr({ error, data: { method: 'getPermission', origin } })
    throw error
  }
}

export async function getPermissions() {
  try {
    return await promisifiedBackground.getPermissions()
  } catch (error) {
    logErr({ error, data: { method: 'getPermissions' } })
    throw error
  }
}
// -------------------------------------------------------------------------------- //

export async function clearImportedAccounts() {
  try {
    return await promisifiedBackground.clearImportedAccounts()
  } catch (error) {
    logErr({ error, data: { method: 'clearImportedAccounts' } })
    throw error
  }
}

export async function createNewWallet(seed, password) {
  try {
    return await promisifiedBackground.createNewWallet(seed, password)
  } catch (error) {
    logErr({ error, data: { method: 'createNewWallet' } })
    throw error
  }
}

export async function restoreWallet(seed, newPassword) {
  try {
    return await promisifiedBackground.restoreWallet(seed, newPassword)
  } catch (error) {
    logErr({ error, data: { method: 'restoreWallet' } })
    throw error
  }
}

// Network
export async function getNetwork() {
  try {
    return await promisifiedBackground.getNetwork()
  } catch (error) {
    logErr({ error, data: { method: 'getNetwork' } })
    throw error
  }
}

export async function updateNetworkProvider(network) {
  try {
    return await promisifiedBackground.updateNetworkProvider(network)
  } catch (error) {
    logErr({ error, data: { method: 'updateNetworkProvider', network } })
    throw error
  }
}

export async function getNetworks() {
  try {
    return await promisifiedBackground.getNetworks()
  } catch (error) {
    logErr({ error, data: { method: 'getNetworks' } })
    throw error
  }
}

export async function addCustomNetwork(network) {
  try {
    const { name, rpcUrl, chainId, currency = ETH_SYMBOL, blockExplorer } = network
    const id = uuidv4()
    const data = {
      [id]: {
        id,
        rpcUrl,
        chainId,
        name,
        currency,
        blockExplorer,
        isMutable: true
      }
    }
    return await promisifiedBackground.addCustomNetwork(data)
  } catch (error) {
    logErr({ error, data: { method: 'addCustomNetwork', network } })
    throw error
  }
}

export async function updateCustomNetwork(network) {
  try {
    const { id, name, rpcUrl, chainId, currency = ETH_SYMBOL, blockExplorer } = network
    const data = {
      [id]: {
        id,
        rpcUrl,
        chainId,
        name,
        currency,
        blockExplorer,
        isMutable: true
      }
    }
    return await promisifiedBackground.addCustomNetwork(data)
  } catch (error) {
    logErr({ error, data: { method: 'updateCustomNetwork', network } })
    throw error
  }
}

export async function removeCustomNetwork(id) {
  try {
    return await promisifiedBackground.removeCustomNetwork(id)
  } catch (error) {
    logErr({ error, data: { method: 'removeCustomNetwork', id } })
    throw error
  }
}

export async function getGasPrice() {
  try {
    const gasPrice = await promisifiedBackground.getGasPrice()
    return fromWei(utils.toBN(gasPrice), UNITS.GWEI)
  } catch (error) {
    logErr({ error, data: { method: 'getGasPrice' } })
    throw error
  }
}

// Token
export function getTokenStandardAndDetails({ tokenAddress, userAddress }) {
  try {
    return promisifiedBackground.getTokenStandardAndDetails(tokenAddress, userAddress)
  } catch (error) {
    logErr({ error, data: { method: 'getTokenStandardAndDetails', tokenAddress, userAddress } })
    throw error
  }
}

export function addToken({ userAddress, tokenDetail }) {
  try {
    return promisifiedBackground.addToken(userAddress, tokenDetail)
  } catch (error) {
    logErr({ error, data: { method: 'getTokenStandardAndDetails', userAddress, tokenDetail } })
    throw error
  }
}

export async function readAddressAsContract(contractAddr) {
  try {
    return await promisifiedBackground.readAddressAsContract(contractAddr)
  } catch (error) {
    logErr({ error, data: { method: 'readAddressAsContract', contractAddr } })
    throw error
  }
}

export async function addNFT({ userAddr, nftItem }) {
  try {
    return await promisifiedBackground.addNFT(userAddr, nftItem)
  } catch (error) {
    logErr({ error, data: { method: 'addNFT', userAddr, nftItem } })
    throw error
  }
}

// Transactions
export async function sendTransaction({
  from,
  to,
  value = 0,
  gas = 10,
  gasPrice = 21000,
  data = '',
  txDetails = {}
}) {
  try {
    return await promisifiedBackground.sendTransaction({
      from,
      to,
      gas: utils.toHex(gas),
      gasPrice: utils.toHex(toWei(gasPrice, UNITS.GWEI)),
      value: utils.toHex(toWei(value)),
      data,
      txDetails
    })
  } catch (error) {
    logErr({ error, data: { method: 'sendTransaction' } })
    throw error
  }
}

export async function estimateGas(requestData) {
  try {
    const gasAsHex = await promisifiedBackground.estimateGas(requestData)
    return parseInt(gasAsHex, 16)
  } catch (error) {
    logErr({ error, data: { method: 'estimateGas', requestData } })
    throw error
  }
}

export async function getTransactions({ address, toAddr }) {
  try {
    return await promisifiedBackground.getTransactions({ address, toAddr })
  } catch (error) {
    logErr({ error, data: { method: 'getTransactions', address, toAddr } })
    throw error
  }
}

export async function getContractMethodData(data = '') {
  try {
    const fourBytePrefix = getFourBytePrefix(data)
    const { name, params } = await getMethodDataAsync(fourBytePrefix)
    return { name, params }
  } catch (error) {
    logErr({ error, data: { method: 'getContractMethodData', data } })
    throw error
  }
}

// Pending Approvals
export async function resolvePendingApproval(id, value) {
  await promisifiedBackground.resolvePendingApproval(id, value)
  closeNotificationPopup()
}

export async function rejectPendingApproval(id, error) {
  await promisifiedBackground.rejectPendingApproval(id, error)
  closeNotificationPopup()
}

export function closeNotificationPopup() {
  // await promisifiedBackground.markNotificationPopupAsAutomaticallyClosed();
  global.platform.closeCurrentWindow()
}
