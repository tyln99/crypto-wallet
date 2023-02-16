const MOCK_TX_HASH = '0x362edc3347cf14185c984733d3ca7089c484abf94757405fbdecc296602437b7'
const MOCK_USER_ADDR = '0xc871A6abC90cebA7a626Eea46E0C2936f2Eb7293'
const MOCK_CONTRACT_ADDR = '0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4' // Box
const MOCK_SYMBOL = 'ZMB'
const MOCK_INVALID_ADDR = 'invalid address'
const MOCK_CHAIN_ID = '0x61' // BSC Testnet
const MOCK_NONCE = 1
const MOCK_PRIVATEKEY = 'private key'
const MOCK_SIGNED_TX = 'signed transaction'
const MOCK_GAS_LIMIT = '335208'

const MOCK_TX = {
  id: '01',
  hash: MOCK_TX_HASH,
  chainId: MOCK_CHAIN_ID,
  blockNumber: '4535101',
  confirmations: '10',
  contractAddress: '',
  cumulativeGasUsed: '120607',
  from: MOCK_USER_ADDR,
  gas: MOCK_GAS_LIMIT,
  gasPrice: '10000000000',
  gasUsed: '21000',
  input: '0x',
  isError: '0',
  nonce: MOCK_NONCE,
  timeStamp: '1543596286',
  to: '0x6bf137f335ea1b8f193b8f6ea92561a60d23a207',
  transactionIndex: '2',
  txreceipt_status: '1',
  value: '100000000000000000'
}
const MOCK_INVALID_TX = { id: '02' }
const MOCK_NULL_TX_RECEIPT = { id: '03', hash: 'not found receipt', time: 0 }
const customMockTx = (props) => ({ ...MOCK_TX, ...props })

export {
  MOCK_TX_HASH,
  MOCK_TX,
  MOCK_INVALID_TX,
  MOCK_NULL_TX_RECEIPT,
  MOCK_CONTRACT_ADDR,
  MOCK_SYMBOL,
  MOCK_INVALID_ADDR,
  MOCK_CHAIN_ID,
  MOCK_USER_ADDR,
  MOCK_NONCE,
  MOCK_PRIVATEKEY,
  MOCK_SIGNED_TX,
  MOCK_GAS_LIMIT,
  customMockTx
}
