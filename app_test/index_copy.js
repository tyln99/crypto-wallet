function isJson(str) {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

function onClickSubmit() {
  document.getElementById('response').innerText = ''
  const method = document.getElementById('method')
  let inputParams = null
  try {
    const paramElement = document.getElementById('params')
    const paramValue = paramElement.value
    if (isJson(paramValue)) {
      inputParams = JSON.parse(paramValue)
    } else {
      inputParams = paramValue
    }
  } catch (error) {
    console.error(error)
  }

  console.log(inputParams)
  console.log('window.zwallet')
  console.log(window.zwallet)
  let objRequest = { method: method.value, params: inputParams }
  if (method.value === 'wallet_contract') {
    objRequest = inputParams
  }
  console.log('Client request: ', objRequest)
  window.zwallet.request(objRequest).then((data) => {
    console.log(`Data ${method.value}`, data)
    document.getElementById('response').innerText = JSON.stringify(data, null, 2)
  })
}

window.onload = function(event) {
  /* 
    - Code to execute when only the HTML document is loaded.
    - This doesn't wait for stylesheets, 
      images, and subframes to finish loading. 
  */
  window.zwallet.accountsChanged((data) => {
    console.log('client handle data accountsChanged:', data)
    document.getElementById('accountsChanged').innerText =
      'Address: ' + JSON.stringify(data, null, 2)
  })

  window.zwallet.chainChanged((data) => {
    console.log('client handle data chainChanged:', data)
    document.getElementById('chainChanged').innerText = JSON.stringify(data, null, 2)
  })

  window.zwallet.connect((data) => {
    console.log('client handle data connect:', data)
    document.getElementById('connected').innerText =
      'Connection info: ' + JSON.stringify(data, null, 2)
  })

  window.zwallet.walletContractHandle((data) => {
    console.log('client handle data walletContractHandle:', data)
    document.getElementById('walletContractHandle').innerText =
      'Contract response: ' + JSON.stringify(data, null, 2)
  })

  window.zwallet.walletTransactionHandle((data) => {
    console.log('client handle data walletTransactionHandle:', data)
    document.getElementById('walletTransactionHandle').innerText =
      'Wallet SendTransaction response: ' + JSON.stringify(data, null, 2)
  })

  console.log('Init watcher')
}
