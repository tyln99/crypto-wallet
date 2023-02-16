/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-undef */
const onGetBalance = async () => {
  try {
    const balance = await this.web3.eth.getBalance(zwallet.selectedAddress)
    document.getElementById('get-balance-rs').innerHTML = this.web3.utils.fromWei(balance)
  } catch (error) {
    document.getElementById('get-balance-rs').innerHTML = error.message
  }
}

const onSend = async () => {
  try {
    var sent = await this.web3.eth.sendTransaction({
      from: zwallet.selectedAddress,
      to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb',
      value: '0x0',
      gas: '0x0',
      gasPrice: '0x0',
      data: ''
    })
    document.getElementById('get-send-rs').innerHTML = beautyJson(sent)
  } catch (error) {
    document.getElementById('get-send-rs').innerHTML = error.message
  }
}

const onRequestPermissions = async () => {
  try {
    const accounts = await zwallet.request({ method: 'wallet_requestPermissions' })
    document.getElementById('request-permissions-rs').innerHTML = beautyJson(accounts)
  } catch (error) {
    document.getElementById('request-permissions-rs').innerHTML = error.message
  }
}

const getGetPermissions = async () => {
  try {
    const accounts = await zwallet.request({ method: 'wallet_getPermissions' })
    document.getElementById('get-permissions-rs').innerHTML = beautyJson(accounts)
  } catch (error) {
    document.getElementById('get-permissions-rs').innerHTML = error.message
  }
}

const onEthAccounts = async () => {
  try {
    const accounts = await zwallet.request({ method: 'eth_accounts' })
    document.getElementById('eth-accounts-rs').innerHTML = beautyJson(accounts)
  } catch (error) {
    document.getElementById('eth-accounts-rs').innerHTML = error.message
  }
}

const onRequestAccounts = async () => {
  try {
    const accounts = await zwallet.request({ method: 'eth_requestAccounts' })
    document.getElementById('get-accounts-rs').innerHTML = beautyJson(accounts)
  } catch (error) {
    document.getElementById('get-accounts-rs').innerHTML = error.message
  }
}

const onMint = async () => {
  try {
    const sent = await this.zmbContract.methods.mint().send({
      from: zwallet.selectedAddress,
      gas: '0x0',
      gasPrice: '0x0',
      value: '0x38D7EA4C68000'
    })
    document.getElementById('mint-rs').innerHTML = beautyJson(sent)
  } catch (error) {
    document.getElementById('mint-rs').innerHTML = error.message
  }
}

const onGetZMBBalance = async () => {
  try {
    const sent = await this.zmbContract.methods.balanceOf(zwallet.selectedAddress).call()
    document.getElementById('get-zmp-balance-rs').innerHTML = beautyJson(sent)
  } catch (error) {
    document.getElementById('get-zmp-balance-rs').innerHTML = error.message
  }
}

const onSwitchNetwork = async () => {
  try {
    zwallet.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x61' }] })
  } catch (error) {}
}

/**
 * eth_sign
 */
const onSign = async () => {
  try {
    // const msg = 'Sample message to hash for signature'
    // const msgHash = keccak256(msg)
    const msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
    const ethResult = await zwallet.request({
      method: 'eth_sign',
      params: [zwallet.selectedAddress, msg]
    })
    document.getElementById('get-sign-rs').innerHTML = ethResult
  } catch (error) {
    document.getElementById('get-sign-rs').innerHTML = error.message
  }
}

window.onload = async function(event) {
  this.web3 = new Web3(window.zwallet)

  this.zmbContract = new web3.eth.Contract(zmpAbi, '0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4')
}

const onChainChanged = (chainId) => {
  console.log('onChainChanged', chainId)
  document.getElementById('chainId').innerHTML = chainId
}

const onAccountsChanged = (addr) => {
  console.log('onAccountsChanged', addr)
  document.getElementById('selectedAddress').innerHTML = addr
}

const onConnect = (chainId) => {
  console.log('onConnect', chainId)
  document.getElementById('connect').innerHTML = chainId
}

const onMessage = (msg) => {
  console.log('onMessage', msg)
  document.getElementById('message-rs').innerHTML = beautyJson(msg)
}

const beautyJson = (obj) => {
  return JSON.stringify(obj, null, 2)
}

window.zwallet.on('data', console.log)
window.zwallet.on('chainChanged', onChainChanged)
window.zwallet.on('accountsChanged', onAccountsChanged)
window.zwallet.on('connect', onConnect)
window.zwallet.on('message', onMessage)
window.zwallet.on('disconnect', console.log)
