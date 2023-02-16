const { BSC_TESTNET_RPC_URL } = require('@shared/constant/network')
const { ERC20Standard } = require('./ERC20Standard')
const Web3 = require('web3')
const { TOKEN_STANDARDS } = require('@shared/constant/app')

let erc20Standard
const URL = BSC_TESTNET_RPC_URL
const USER_ADDR = '0xc871A6abC90cebA7a626Eea46E0C2936f2Eb7293'
const CONTRACT_ADDR = '0xa6Edc823F798d9f9E770591A9b9F637037699E70' // ZToken
const DECIMALS = '18' // ZToken's decimals
const SYMBOL = 'ZToken'
const INVALID_ADDR = 'invalid address'

describe('ERC20Standard', () => {
  beforeAll(() => {
    const web3 = new Web3(new Web3.providers.HttpProvider(URL))
    erc20Standard = new ERC20Standard(web3)
  })

  describe('getBalanceOf', () => {
    it('given invalid contract address', () => {
      expect(() => erc20Standard.getBalanceOf(INVALID_ADDR, USER_ADDR)).toThrow()
    })
    it('given invalid user address', async () => {
      await expect(erc20Standard.getBalanceOf(CONTRACT_ADDR, INVALID_ADDR)).rejects.toThrow()
    })
    it('given valid input', async () => {
      await expect(erc20Standard.getBalanceOf(CONTRACT_ADDR, USER_ADDR)).resolves.not.toThrow()
    })
  })

  describe('getTokenDecimals', () => {
    it('given invalid contract address', () => {
      expect(() => erc20Standard.getTokenDecimals(INVALID_ADDR)).toThrow()
    })
    it('given valid input', async () => {
      await expect(erc20Standard.getTokenDecimals(CONTRACT_ADDR)).resolves.toEqual(DECIMALS)
    })
  })

  describe('getTokenSymbol', () => {
    it('given invalid contract address', () => {
      expect(() => erc20Standard.getTokenSymbol(INVALID_ADDR)).toThrow()
    })
    it('given valid input', async () => {
      await expect(erc20Standard.getTokenSymbol(CONTRACT_ADDR)).resolves.toEqual(SYMBOL)
    })
  })

  describe('getDetails', () => {
    it('given invalid contract address', async () => {
      await expect(erc20Standard.getDetails(INVALID_ADDR, USER_ADDR)).rejects.toThrow()
    })
    it('given valid input', async () => {
      await expect(erc20Standard.getDetails(CONTRACT_ADDR, USER_ADDR)).resolves.toMatchObject({
        address: CONTRACT_ADDR,
        decimals: DECIMALS,
        symbol: SYMBOL,
        standard: TOKEN_STANDARDS.ERC20
      })
    })
  })
})
