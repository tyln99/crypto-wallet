import ethAccounts from './eth_accounts'
import getPermissions from './get-permissions'
import getProviderState from './get-provider-state'
import requestAccounts from './request-accounts'
import requestPermissions from './request-permissions'
import sendTransaction from './send-transaction'
import signMessage from './sign-message'
import switchEthereumChain from './switch-ethereum-chain'

const handlers = [
  switchEthereumChain,
  signMessage,
  requestAccounts,
  requestPermissions,
  sendTransaction,
  getProviderState,
  ethAccounts,
  getPermissions
]
export default handlers
