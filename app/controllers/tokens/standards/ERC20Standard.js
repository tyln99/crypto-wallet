import { TOKEN_STANDARDS } from '@shared/constant/app'
import { abiERC20 } from './abis/abiERC20'

/**
 * @class
 */
export class ERC20Standard {
  constructor(web3) {
    this.web3 = web3
  }

  /**
   * Get balance or count for current account on specific asset contract.
   *
   * @param address - Asset ERC20 contract address.
   * @param selectedAddress - Current account public address.
   * @returns Promise resolving to BN object containing balance for current account on specific asset contract.
   */
  getBalanceOf(contractAddr, userAddr) {
    const contract = new this.web3.eth.Contract(abiERC20, contractAddr)
    return new Promise((resolve, reject) => {
      contract.methods
        .balanceOf(userAddr)
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
   * Query for the decimals for a given ERC20 asset.
   *
   * @param address - ERC20 asset contract string.
   * @returns Promise resolving to the 'decimals'.
   */
  getTokenDecimals(address) {
    const contract = new this.web3.eth.Contract(abiERC20, address)
    return new Promise((resolve, reject) => {
      contract.methods
        .decimals()
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
   * Query for symbol for a given ERC20 asset.
   *
   * @param address - ERC20 asset contract address.
   * @returns Promise resolving to the 'symbol'.
   */
  getTokenSymbol(address) {
    const contract = new this.web3.eth.Contract(abiERC20, address)
    return new Promise((resolve, reject) => {
      contract.methods
        .symbol()
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
   * Query if a contract implements an interface.
   *
   * @param address - Asset contract address.
   * @param userAddress - The public address for the currently active user's account.
   * @returns Promise resolving an object containing the standard, decimals, symbol and balance of the given contract/userAddress pair.
   */
  async getDetails(address, userAddress) {
    const [decimals, symbol] = await Promise.all([
      this.getTokenDecimals(address),
      this.getTokenSymbol(address)
    ])

    let balance
    if (userAddress) {
      balance = await this.getBalanceOf(address, userAddress)
    }
    return {
      address,
      decimals,
      symbol,
      balance,
      standard: TOKEN_STANDARDS.ERC20
    }
  }

  /**
   * Get token name
   *
   * @param {*} address
   * @returns token name
   */
  async getTokenName(address) {
    const contract = new this.web3.eth.Contract(abiERC20, address)
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
