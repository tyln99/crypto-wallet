// common
export const dappOptionsSelector = (state) => state.common.dappOptions

// accounts
export const selectedAccountSelector = (state) => state.account.selectedAccount
export const listAccountsSelector = (state) => state.account.listAccounts

// network
export const selectedNetworkSelector = (state) => state.network.selectedNetwork
export const listNetworksSelector = (state) => state.network.listNetworks

// token
export const selectedTokenSelector = (state) => state.token.selectedToken
