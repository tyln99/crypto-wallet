const { default: ExtensionStore } = require('@app/scripts/lib/local-store')
const { TOKEN_STANDARDS } = require('@shared/constant/app')
const { BSC_TESTNET_RPC_URL, BSC_TESTNET_CHAIN_ID } = require('@shared/constant/network')
const Web3 = require('web3')
const { ERC20Standard } = require('./standards/ERC20Standard')
const { ERC721Standard } = require('./standards/ERC721Standard')
const { TokensController } = require('./TokensController')
jest.mock('@app/scripts/lib/local-store')

let tokenController
const URL = BSC_TESTNET_RPC_URL
const USER_ADDR = '0xc871A6abC90cebA7a626Eea46E0C2936f2Eb7293'
const CONTRACT_ADDR = '0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4' // Box
const SYMBOL = 'ZMB'
const INVALID_ADDR = 'invalid address'
const CHAIN_ID = BSC_TESTNET_CHAIN_ID

describe('TokensController', () => {
  beforeAll(() => {
    const web3 = new Web3(new Web3.providers.HttpProvider(URL))
    //   erc721Standard = new ERC721Standard(web3)
    //   erc20Standard = new ERC20Standard(web3)
    ExtensionStore.mockImplementation(() => {
      return {
        get: () => {
          return new Promise((resolve, reject) => {
            resolve({})
          })
        },
        set: (value) => {
          return new Promise((resolve, reject) => {
            resolve(value)
          })
        }
      }
    })
    tokenController = new TokensController({
      getNetwork: () => ({
        chainId: CHAIN_ID
      })
    })
    tokenController.web3 = web3
    tokenController.erc20Standard = new ERC20Standard(web3)
    tokenController.erc721Standard = new ERC721Standard(web3)
    tokenController.extensionStore = new ExtensionStore()
  })

  describe('readAddressAsContract', () => {
    it('given invalid contract address', async () => {
      const func = tokenController.readAddressAsContract(INVALID_ADDR)
      await expect(func).resolves.toMatchObject({ contractCode: null, isContractAddress: null })
    })
  })

  describe('getListTokens', () => {
    it('should throw invalid userAddress', async () => {
      const func = tokenController.getListTokens(CHAIN_ID, INVALID_ADDR)
      await expect(func).rejects.toThrow()
    })
    it('should throw invalid chainId', async () => {
      const func = tokenController.getListTokens(CHAIN_ID, INVALID_ADDR)
      await expect(func).rejects.toThrow()
    })
    it('should return list tokens', async () => {
      const func = tokenController.getListTokens(CHAIN_ID, USER_ADDR)
      await expect(func).resolves.toEqual({})
    })
  })

  describe('addToken', () => {
    it('should throw invalid userAddress', async () => {
      const func = tokenController.addToken(null, {})
      await expect(func).rejects.toThrow()
    })
    it('should throw invalid token detail', async () => {
      const func = tokenController.addToken(USER_ADDR, {})
      await expect(func).rejects.toThrow()
    })
    it('should return added token details', async () => {
      const func = tokenController.addToken(USER_ADDR, { address: CONTRACT_ADDR })
      await expect(func).resolves.toEqual({ address: CONTRACT_ADDR.toLowerCase() })
    })
  })

  describe('getListNFTS', () => {
    it('should throw invalid user address', async () => {
      const func = tokenController.getListNFTS(INVALID_ADDR)
      await expect(func).rejects.toThrow()
    })
    it('should return list NFTs', async () => {
      const func = tokenController.getListNFTS(USER_ADDR)
      await expect(func).resolves.toEqual({})
    })
  })

  describe('updateListNFTS', () => {
    it('should throw invalid chainId', async () => {
      const func = tokenController.updateListNFTS(null, USER_ADDR, {})
      await expect(func).rejects.toThrow()
    })
    it('should throw invalid user address', async () => {
      const func = tokenController.updateListNFTS(CHAIN_ID, null, {})
      await expect(func).rejects.toThrow()
    })
    it('should return true', async () => {
      const func = tokenController.updateListNFTS(CHAIN_ID, USER_ADDR, {})
      await expect(func).resolves.toEqual(true)
    })
  })

  describe('getOwnerOfItem', () => {
    it('should throw invalid contract address', async () => {
      const func = tokenController.getOwnerOfItem(null, '1')
      await expect(func).rejects.toThrow()
    })
    it('should not throw error', async () => {
      const func = tokenController.getOwnerOfItem(CONTRACT_ADDR, '1')
      await expect(func).resolves.not.toThrow()
    })
  })

  describe('addNFT', () => {
    it('should throw invalid user address', async () => {
      const func = tokenController.addNFT(null, { id: '1' })
      await expect(func).rejects.toThrow()
    })
    it('should throw user does not own this nft item', async () => {
      tokenController.erc721Standard.getOwnerOf = jest.fn(() => '')
      const func = tokenController.addNFT(USER_ADDR, { id: '1', address: CONTRACT_ADDR })
      await expect(func).rejects.toThrow()
    })
    it('should return added nftItem', async () => {
      tokenController.erc721Standard.getOwnerOf = jest.fn(() => USER_ADDR)
      const func = tokenController.addNFT(USER_ADDR, { id: '1', address: CONTRACT_ADDR })
      await expect(func).resolves.toMatchObject({ id: '1', address: CONTRACT_ADDR.toLowerCase() })
    })
  })

  describe('removeNFT', () => {
    it('should throw invalid user address', async () => {
      const func = tokenController.removeNFT(null, USER_ADDR)
      await expect(func).rejects.toThrow()
    })
    it('should throw invalid contract address', async () => {
      const func = tokenController.removeNFT(CONTRACT_ADDR, null)
      await expect(func).rejects.toThrow()
    })
    it('should return true if remove success or item does exists', async () => {
      const func = tokenController.removeNFT(CONTRACT_ADDR, USER_ADDR)
      await expect(func).resolves.toEqual(true)
    })
  })

  describe('getTokenStandardAndDetails', () => {
    it('should throw invalid contract address', async () => {
      const func = tokenController.getTokenStandardAndDetails(null, USER_ADDR)
      await expect(func).rejects.toThrow()
    })
    // it('should throw invalid user address', async () => {
    //   const func = tokenController.getTokenStandardAndDetails(CONTRACT_ADDR, null)
    //   await expect(func).rejects.toThrow()
    // })
    it('should return ERC721 standard detail', async () => {
      const func = tokenController.getTokenStandardAndDetails(CONTRACT_ADDR, USER_ADDR)
      await expect(func).resolves.toMatchObject({
        standard: TOKEN_STANDARDS.ERC721,
        symbol: SYMBOL
      })
    })
  })
})
