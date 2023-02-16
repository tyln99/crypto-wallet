import { STORAGE_KEYS } from '@shared/constant/app'
import { ERC20Standard } from './standards/ERC20Standard'
import { ERC721Standard } from './standards/ERC721Standard'
import ExtensionStore from '@app/scripts/lib/local-store'
import { compare } from '@shared/util/string'
import { log, logWarn } from '@shared/util/logger'
import Web3 from 'web3'
import { isAddress, isHex } from 'web3-utils'
import fetchWithCache from '@shared/util/fetch-with-cache'

/**
 * Manage Tokens, NFTS
 * @class
 */
export class TokensController {
  constructor(opts) {
    // super()
    this.extensionStore = new ExtensionStore()
    this.getNetwork = opts.getNetwork
    this.provider = opts.provider
    this.web3 = new Web3(this.provider)
    this.erc20Standard = new ERC20Standard(this.web3)
    this.erc721Standard = new ERC721Standard(this.web3)
  }

  /**
   * Check is valid contract
   *
   * @param {*} address contract address
   * @returns {Promise<string>} contractCode and is contract or not
   */
  async readAddressAsContract(address) {
    let contractCode
    try {
      contractCode = await this.web3.eth.getCode(address)
    } catch (e) {
      contractCode = null
    }

    const isContractAddress = contractCode && contractCode !== '0x' && contractCode !== '0x0'
    return { contractCode, isContractAddress }
  }

  /**
   * Get list stored Tokens by chainId and userAddress
   *
   * @param {*} chainId
   * @param {*} userAddress
   * @returns {Promise<Array>} list tokens
   */
  async getListTokens(chainId, userAddress) {
    try {
      if (!isAddress(userAddress)) {
        throw new Error('User address is invalid')
      }
      if (!isHex(chainId)) {
        throw new Error('ChainId is invalid')
      }
      const data = await this.extensionStore.get()
      const tokensData = data[STORAGE_KEYS.TOKENS]
      if (tokensData && tokensData[chainId] && tokensData[chainId][userAddress]) {
        log('tokens: ', tokensData[chainId][userAddress])
        return tokensData[chainId][userAddress]
      } else {
        return {}
      }
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Store new token data to local
   *
   * @param {*} chainId
   * @param {*} userAddress
   * @param {*} token
   * @returns {Promise<boolean>} success or fail
   */
  async addToken(userAddress, tokenDetail) {
    try {
      if (!isAddress(userAddress)) {
        throw new Error('User address is invalid')
      }
      if (!tokenDetail) {
        throw new Error('Token detail cannot be empty')
      }

      userAddress = userAddress.toLowerCase()
      tokenDetail.address = tokenDetail.address.toLowerCase()

      const chainId = this.getNetwork().chainId
      const data = await this.extensionStore.get()
      let tokensData = data[STORAGE_KEYS.TOKENS]
      tokensData = tokensData || {}
      tokensData[chainId] = tokensData[chainId] || {}
      tokensData[chainId][userAddress] = tokensData[chainId][userAddress] || {}
      tokensData[chainId][userAddress][tokenDetail.address] = tokenDetail
      await this.extensionStore.set({ [STORAGE_KEYS.TOKENS]: tokensData })
      return tokenDetail
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Get list stored nfts by chainId and userAddress
   *
   * @param {*} userAddr
   * @returns {Promise<Array>} list stored nfts
   */
  async getListNFTS(userAddr) {
    try {
      if (!isAddress(userAddr)) {
        throw new Error('User address is invalid')
      }
      const chainId = this.getNetwork().chainId
      userAddr = userAddr.toLowerCase()
      log('Get list nfts', chainId, userAddr)
      const data = await this.extensionStore.get()
      const nftsData = data[STORAGE_KEYS.NFTS]
      if (nftsData && nftsData[chainId] && nftsData[chainId][userAddr]) {
        log('nfts: ', nftsData[chainId][userAddr])
        return nftsData[chainId][userAddr]
      } else {
        return {}
      }
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Update current stored nfts
   *
   * @param {*} chainId
   * @param {*} userAddress
   * @param {*} newList
   * @returns {Promise<boolean>} success or fail
   */
  async updateListNFTS(chainId, userAddress, newList) {
    try {
      if (!isHex(chainId)) {
        throw new Error('ChainId is invalid')
      }
      if (!isAddress(userAddress)) {
        throw new Error('User address is invalid')
      }
      userAddress = userAddress.toLowerCase()
      const data = await this.extensionStore.get()
      let nfts = data[STORAGE_KEYS.NFTS]
      nfts = nfts || {}
      nfts[chainId] = nfts[chainId] || {}
      nfts[chainId][userAddress] = nfts[chainId][userAddress] || {}
      nfts[chainId][userAddress] = newList
      await this.extensionStore.set({ [STORAGE_KEYS.NFTS]: nfts })
      return true
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Query owner of an item (tokenId)
   *
   * @param {*} contractAddr
   * @param {*} tokenId
   * @returns {Promise<string>} owner address
   */
  async getOwnerOfItem(contractAddr, tokenId) {
    try {
      if (!isAddress(contractAddr)) {
        throw new Error('Contract address is invalid')
      }
      return await this.erc721Standard.getOwnerOf(contractAddr, tokenId)
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Add new nft item to local storage
   *
   * @param {*} userAddr
   * @param {*} nftItem
   */
  async addNFT(userAddr, nftItem) {
    try {
      if (!isAddress(userAddr)) {
        throw new Error('User address is invalid')
      }
      if (!nftItem) {
        throw new Error('NftItem cannot be empty')
      }

      log('On add NFT')
      const chainId = this.getNetwork().chainId
      // reformat addresses
      userAddr = userAddr.toLowerCase()
      nftItem.address = nftItem.address.toLowerCase()
      log(chainId, userAddr, nftItem)

      const result = await this.erc721Standard.getOwnerOf(nftItem.address, nftItem.id)
      if (!compare(result, userAddr)) {
        throw new Error("You don't own this item!")
      }

      // get item metadata
      let uri = await this.erc721Standard.getTokenURI(nftItem.address, nftItem.id)
      const metadata = await this.fetchMetadata(uri, nftItem.id)
      nftItem.metadata = metadata || null

      // get contract name
      let tokenName
      try {
        tokenName = await this.erc721Standard.getTokenName(nftItem.address)
      } catch (error) {
        logWarn(error)
      }

      // store to storage
      const data = await this.extensionStore.get()
      let nfts = data[STORAGE_KEYS.NFTS]
      nfts = nfts || {}
      nfts[chainId] = nfts[chainId] || {}
      nfts[chainId][userAddr] = nfts[chainId][userAddr] || {}
      nfts[chainId][userAddr][nftItem.address] = nfts[chainId][userAddr][nftItem.address] || {}
      nfts[chainId][userAddr][nftItem.address]['items'] =
        nfts[chainId][userAddr][nftItem.address]['items'] || {}
      nfts[chainId][userAddr][nftItem.address]['items'][`${nftItem.id}`] = nftItem
      nfts[chainId][userAddr][nftItem.address]['name'] = tokenName
      log(nfts)
      await this.extensionStore.set({ [STORAGE_KEYS.NFTS]: nfts })
      return nftItem
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  async fetchMetadata(uri) {
    try {
      uri = uri.replace(
        'https://stg-api-herozst.zstudio.io/character-card',
        'https://dev-api.monoland.io/character-card'
      )
      return await fetchWithCache(uri, {
        method: 'GET'
      })
    } catch (error) {
      logWarn(error)
    }
  }

  /**
   * Remove an nft item from user nfts collection
   * after call transfer or transferFrom successfully
   *
   * @param {*} userAddress
   * @param {*} contractAddress
   * @param {*} tokenId
   * @returns {Promise<boolean>} success or fail
   */
  async removeNFT(userAddress, contractAddress, tokenId) {
    try {
      if (!isAddress(userAddress)) {
        throw new Error('User address is invalid')
      }
      if (!isAddress(contractAddress)) {
        throw new Error('Contract address is invalid')
      }
      userAddress = userAddress.toLowerCase()
      contractAddress = contractAddress.toLowerCase()
      const chainId = await this.web3.eth.net.getId()
      log('On remove NFT: ', chainId, userAddress, contractAddress, tokenId)
      const data = await this.extensionStore.get()
      let nfts = data[STORAGE_KEYS.NFTS]
      if (
        nfts &&
        nfts[chainId] &&
        nfts[chainId][userAddress] &&
        nfts[chainId][userAddress][contractAddress] &&
        nfts[chainId][userAddress][contractAddress][tokenId]
      ) {
        delete nfts[chainId][userAddress][contractAddress][tokenId]
        log('List NFTs after remove: ', nfts)
        await this.extensionStore.set({ [STORAGE_KEYS.NFTS]: nfts })
      }
      return true
    } catch (error) {
      // logErr(error)
      throw error
    }
  }

  /**
   * Enumerate assets assigned to an owner.
   *
   * @param {*} tokenAddress - ERC721 asset contract address.
   * @param {*} userAddress - Current account public address.
   * @param {*} tokenId - ERC721 asset identifier.
   * @returns {Promise<Object>} token details
   */
  async getTokenStandardAndDetails(tokenAddress, userAddress) {
    if (!isAddress(tokenAddress)) {
      throw new Error('Contract address is invalid')
    }
    // if (!isAddress(userAddress)) {
    //   throw new Error('User address is invalid')
    // }
    if (!this.erc20Standard && !this.erc721Standard) {
      throw new Error('Missing token standards')
    }

    log('get tokens details', tokenAddress, userAddress)
    try {
      return await this.erc20Standard.getDetails(tokenAddress, userAddress)
    } catch (error) {
      // Ignore
    }

    try {
      return await this.erc721Standard.getDetails(tokenAddress, userAddress)
    } catch (error) {
      // Ignore
    }

    throw new Error('Unable to determine contract standard')
  }
}
