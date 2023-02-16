import { ethers } from 'ethers'
import { abiERC20 } from '@app/controllers/tokens/standards/abis/abiERC20'
import { abiERC721 } from '@app/controllers/tokens/standards/abis/abiERC721'
import fetchWithCache from './fetch-with-cache'
import { MethodRegistry } from 'eth-method-registry'
import { log, logErr } from './logger'
import { addHexPrefix } from './util'

const erc20Interface = new ethers.utils.Interface(abiERC20)
const erc721Interface = new ethers.utils.Interface(abiERC721)
let registry

export async function parseStandardTokenTransactionData(data) {
  if (!registry) {
    registry = new MethodRegistry({
      provider: global.ethereumProvider
    })
  }
  try {
    const txDescription = erc20Interface.parseTransaction({ data })
    return registry.parse(txDescription.signature)
  } catch {
    // ignore and next try to parse with erc721 ABI
  }

  try {
    const txDescription = erc721Interface.parseTransaction({ data })
    return registry.parse(txDescription.signature)
  } catch {
    // ignore and next try to parse with erc1155 ABI
  }

  const fourBytePrefix = getFourBytePrefix(data)
  const methodData = await getMethodDataAsync(fourBytePrefix)
  if (methodData) {
    return { name: methodData.name, params: methodData.params }
  }

  return undefined
}

async function getMethodFrom4Byte(fourBytePrefix) {
  const fourByteResponse = await fetchWithCache(
    `https://www.4byte.directory/api/v1/signatures/?hex_signature=${fourBytePrefix}`,
    {
      referrerPolicy: 'no-referrer-when-downgrade',
      body: null,
      method: 'GET',
      mode: 'cors'
    }
  )
  if (fourByteResponse.count >= 1) {
    return fourByteResponse.results[fourByteResponse.count - 1].text_signature
  }
  return null
}

/**
 * Attempts to return the method data from the MethodRegistry library, the message registry library and the token abi, in that order of preference
 *
 * @param {string} fourBytePrefix - The prefix from the method code associated with the data
 * @returns {Object}
 */
export async function getMethodDataAsync(fourBytePrefix) {
  try {
    let sig = await registry.lookup(fourBytePrefix)

    if (!sig) {
      sig = await getMethodFrom4Byte(fourBytePrefix).catch((e) => {
        log(e)
        return null
      })
    }

    if (!sig) {
      return {}
    }
    const parsedResult = registry.parse(sig)

    return {
      name: parsedResult.name,
      params: parsedResult.args
    }
  } catch (error) {
    logErr({ error, data: { fourBytePrefix } })
    return {}
  }
}

/**
 * Returns four-byte method signature from data
 *
 * @param {string} data - The hex data (@code txParams.data) of a transaction
 * @returns {string} The four-byte method signature
 */
export function getFourBytePrefix(data = '') {
  const prefixedData = addHexPrefix(data)
  const fourBytePrefix = prefixedData.slice(0, 10)
  return fourBytePrefix
}
