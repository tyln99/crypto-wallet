const { BSC_TESTNET_RPC_URL } = require('@shared/constant/network')
const { ERC721Standard } = require('./ERC721Standard')
const Web3 = require('web3')
const { TOKEN_STANDARDS } = require('@shared/constant/app')

let erc721Standard
const URL = BSC_TESTNET_RPC_URL
const USER_ADDR = '0xc871A6abC90cebA7a626Eea46E0C2936f2Eb7293'
const CONTRACT_ADDR = '0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4' // Box
const SYMBOL = 'ZMB'
const INVALID_ADDR = 'invalid address'

describe('ERC721Standard', () => {
  beforeAll(() => {
    const web3 = new Web3(new Web3.providers.HttpProvider(URL))
    erc721Standard = new ERC721Standard(web3)
  })

  describe('getBalanceOf', () => {
    it('given invalid contract address', () => {
      expect(() => erc721Standard.getBalanceOf(INVALID_ADDR, USER_ADDR)).toThrow()
    })
    it('given invalid user address', async () => {
      await expect(erc721Standard.getBalanceOf(CONTRACT_ADDR, INVALID_ADDR)).rejects.toThrow()
    })
    it('given valid input', async () => {
      await expect(erc721Standard.getBalanceOf(CONTRACT_ADDR, USER_ADDR)).resolves.not.toThrow()
    })
  })

  describe('getTokenSymbol', () => {
    it('given invalid contract address', () => {
      expect(() => erc721Standard.getTokenSymbol(INVALID_ADDR)).toThrow()
    })
    it('given valid input', async () => {
      await expect(erc721Standard.getTokenSymbol(CONTRACT_ADDR)).resolves.toEqual(SYMBOL)
    })
  })

  describe('getDetails', () => {
    it('given invalid contract address', async () => {
      await expect(erc721Standard.getDetails(INVALID_ADDR, USER_ADDR)).rejects.toThrow()
    })
    it('given valid input', async () => {
      await expect(erc721Standard.getDetails(CONTRACT_ADDR, USER_ADDR)).resolves.toMatchObject({
        address: CONTRACT_ADDR,
        symbol: SYMBOL,
        standard: TOKEN_STANDARDS.ERC721
      })
    })
  })

  describe('getOwnerOf', () => {
    it('given invalid contract address', async () => {
      expect(() => erc721Standard.getOwnerOf(INVALID_ADDR, '1')).toThrow()
    })
    // don't check case success
  })
})
