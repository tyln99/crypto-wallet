import { TOKEN_STANDARDS } from '@shared/constant/app'
import { abiERC721 } from './abis/abiERC721'
import { log } from '@shared/util/logger'

/**
 * @class
 */
export class ERC721Standard {
  constructor(web3) {
    this.web3 = web3
  }

  /**
   * Get balance or count for current account on specific asset contract.
   *
   * @param tokenAddress - Asset ERC721 contract address.
   * @param userAddress - Current account public address.
   * @returns Promise resolving to BN object containing balance for current account on specific asset contract.
   */
  getBalanceOf(tokenAddress, userAddress) {
    const contract = new this.web3.eth.Contract(abiERC721, tokenAddress)
    log('contract:', tokenAddress, userAddress, contract)
    return new Promise((resolve, reject) => {
      contract.methods
        .balanceOf(userAddress)
        .call()
        .then((result, error) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }

  /**
   * Query for symbol for a given ERC721 asset.
   *
   * @param address - ERC721 asset contract address.
   * @returns Promise resolving to the 'symbol'.
   */
  getTokenSymbol(address) {
    const contract = new this.web3.eth.Contract(abiERC721, address)
    return new Promise(async (resolve, reject) => {
      await contract.methods
        .symbol()
        .call()
        .then((result, error) => {
          if (error) {
            // logErr(error)
            reject(error)
            return
          }
          resolve(result)
        })
        .catch((e) => {
          // log(e)
          reject(e)
        })
    })
  }

  /**
   * Query if a contract implements an interface.
   *
   * @param address - Asset contract address.
   * @param userAddress - The public address for the currently active user's account.
   * @returns Promise resolving an object containing the standard, decimals, symbol and balance of the given contract/userAddress pair.
   */
  async getDetails(address, userAddress) {
    const symbol = await this.getTokenSymbol(address)
    let balance
    if (userAddress) {
      balance = await this.getBalanceOf(address, userAddress)
    }
    return {
      address,
      symbol,
      balance,
      standard: TOKEN_STANDARDS.ERC721
    }
  }

  /**
   * Get address own this item
   *
   * @param {*} address - contract address
   * @param {*} id - id of item
   * @returns {Address} - account address
   */
  getOwnerOf(address, id) {
    const contract = new this.web3.eth.Contract(abiERC721, address)
    return new Promise((resolve, reject) => {
      try {
        contract.methods
          .ownerOf(id)
          .call()
          .then((result, error) => {
            if (error) {
              // logErr(error)
              reject(error)
              return
            }
            // log(result, error)
            resolve(result)
          })
          .catch((e) => {
            // log(e)
            reject(e)
          })
      } catch (error) {
        // logErr(error)
        reject(error)
      }
    })
  }

  /**
   * Get token metadata URI
   *
   * @param {*} address - contract address
   * @param {*} id - nft id
   *
   * @returns url for fetch token metadata
   */
  getTokenURI(address, id) {
    const contract = new this.web3.eth.Contract(abiERC721, address)
    return new Promise((resolve, reject) => {
      try {
        contract.methods
          .tokenURI(id)
          .call()
          .then((result, error) => {
            if (error) {
              reject(error)
              return
            }
            resolve(result)
          })
          .catch((e) => {
            reject(e)
          })
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Get token name
   *
   * @param {*} address
   * @returns token name
   */
  async getTokenName(address) {
    const contract = new this.web3.eth.Contract(abiERC721, address)
    return new Promise((resolve, reject) => {
      contract.methods
        .name()
        .call()
        .then((result, error) => {
          if (error) {
            reject(error)
            return
          }
          resolve(result)
        })
        .catch((e) => {
          reject(e)
        })
    })
  }
}
