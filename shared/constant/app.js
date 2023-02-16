export const ENV_TYPE_POPUP = 'popup'
export const ENV_TYPE_NOTIFICATION = 'notification'
export const ENV_TYPE_FULLSCREEN = 'fullscreen'
export const ENV_TYPE_BACKGROUND = 'background'

export const PLATFORM_CHROME = 'Chrome'
export const PLATFORM_EDGE = 'Edge'
export const PLATFORM_FIREFOX = 'Firefox'
export const PLATFORM_OPERA = 'Opera'

export const TRANSACTION_STATUSES = {
  UNAPPROVED: 'unapproved',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SIGNED: 'signed',
  SUBMITTED: 'submitted',
  FAILED: 'failed',
  DROPPED: 'dropped',
  CONFIRMED: 'confirmed',
  PENDING: 'pending'
}

export const MESSAGE_TYPE = {
  ADD_ETHEREUM_CHAIN: 'wallet_addEthereumChain',
  WALLET_DECRYPT: 'wallet_decrypt',
  WALLET_GET_ENCRYPTION_PUBLIC_KEY: 'wallet_getEncryptionPublicKey',
  REQUEST_ACCOUNTS: 'eth_requestAccounts',
  ZSIGN: 'zsign',
  WALLET_SIGN_TYPED_DATA: 'wallet_signTypedData',
  // GET_PROVIDER_STATE: 'metamask_getProviderState',
  LOG_WEB3_SHIM_USAGE: 'metamask_logWeb3ShimUsage',
  PERSONAL_SIGN: 'personal_sign',
  ETH_SIGN: 'eth_sign',
  SEND_METADATA: 'metamask_sendDomainMetadata',
  SWITCH_ETHEREUM_CHAIN: 'wallet_switchEthereumChain',
  WATCH_ASSET: 'wallet_watchAsset',
  WALLET_SEND_TRANSACTION: 'eth_sendTransaction',
  GET_PROVIDER_STATE: 'zwallet_getProviderState',
  EH_ACCOUNTS: 'eth_accounts',
  WATCH_ASSET_LEGACY: 'metamask_watchAsset',
  WALLET_REQUEST_PERMISSIONS: 'wallet_requestPermissions',
  WALLET_GET_PERMISSIONS: 'wallet_getPermissions'
}

export const CALLBACK_TYPE = {
  SIGN_MESSAGE: 1
}

export const ZWALLET_LAYOUT = {
  SIGN_MESSAGE: 1,
  SWITCH_CHAIN: 2,
  REQUEST_PERMISSION: 3,
  SEND_TRANSACTION: 4,
  APPROVE_CONTRACT: 5,
  WALLET_CONTRACT: 6
}

export const CONTENTSCRIPT = 'zwallet-contentscript'
export const INPAGE = 'zwallet-inpage'
export const BACKGROUND = 'zwallet-background'
export const POPUP = 'zwallet-popup'

export const ACCOUNT_TYPE = {
  CREATED: 'CREATED',
  IMPORTED: 'Imported'
}

export const DERIVATION_PATH = "m/44'/60'/0'/0/"

export const TOKEN_STANDARDS = {
  ERC721: 'ERC721',
  ERC1155: 'ERC1155',
  ERC20: 'ERC20',
  CUSTOM: 'CUSTOM'
}

export const CONTRACT_METHODS = {
  transfer: 'transfer',
  Transfer: 'Transfer',
  transferFrom: 'transferFrom'
}

export const UNITS = {
  WEI: 'wei',
  GWEI: 'gwei',
  ETHER: 'ether'
}

export const EMIT_METHODS = {
  ACCOUNT_CHANGED: 'accountsChanged',
  CHAIN_CHANGED: 'chainChanged',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  CONNECT: 'connect',
  TRANSACTION_UPDATE: 'transactionUpdate',
  ETH_SUBSCRIPTION: 'eth_subscription'
}

export const STORAGE_KEYS = {
  TOKENS: 'Tokens',
  NFTS: 'NFTS',
  WALLET: 'Wallet',
  IMPORTED_ACCOUNTS: 'ImportedAccounts',
  TRANSACTIONS: 'transactions',
  CUSTOM_NETWORKS: 'custom_networks',
  PERMISSION_CONTROLLER: 'PermissionController',
  CONTACTS: 'Contacts'
}

export const WRITE_METHODS = ['transfer', 'transferFrom', 'safeTransferFrom', 'mint', 'approve']
export const READ_METHODS = [
  'balanceOf',
  'symbol',
  'decimals',
  'name',
  'domain',
  'ownerOf',
  'totalSupply'
]

export const ENVIRONMENT = {
  PRODUCTION: 'production',
  DEVELOPMENT: 'development'
}

export const CONTRACT_METHOD = {
  INTEGRATION: 'Contract Integration',
  DEPLOYMENT: 'Contract Deployment'
}

export const MINIMUM_GAS_LIMIT = 21000

export const fieldNames = {
  RECEIVER_ADDRESS: 'receiverAddress',
  AMOUNT: 'amount',
  GAS_PRICE: 'gasPrice',
  GAS_LIMIT: 'gasLimit',
  DATA: 'data'
}

export const CONTACT_TYPE = {
  INTERNAL: 'internal',
  EXTERNAL: 'external'
}
