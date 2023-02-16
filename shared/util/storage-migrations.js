import ExtensionStore from '@app/scripts/lib/local-store'
import { NETWORK_ID_TO_CHAIN_ID_MAP } from '@shared/constant/network'
import { forOwn, isEqual, isNull, isUndefined, merge } from 'lodash'
import { log, logErr } from './logger'
import { STORAGE_KEYS } from '@shared/constant/app'
import { toHex } from 'web3-utils'

const activitiesToTransactions = async ({ callback }) => {
  log('==== MIGRATE ACTIVITIES TO TRANSACTION ====')
  try {
    const extensionStore = new ExtensionStore()
    const data = await extensionStore.get()
    const atvtData = data['Activities']

    if (atvtData) {
      const list = {}
      forOwn(atvtData, (addressLevel, chainId) => {
        forOwn(addressLevel, (symbolLevel) => {
          forOwn(symbolLevel, (transactionLevel) => {
            forOwn(transactionLevel, (item) => {
              const tx = convertTx(item, chainId)
              if (tx) {
                list[tx.id] = tx
              }
            })
          })
        })
      })
      log(list)
      if (!isEqual(list, {})) {
        const currData = (await extensionStore.get())[STORAGE_KEYS.TRANSACTIONS]
        await extensionStore.set({
          [STORAGE_KEYS.TRANSACTIONS]: merge(currData, list)
        })
        callback()
      }
    }
  } catch (error) {
    logErr({ error })
  }
}

const convertTx = (tx, chainId) => {
  try {
    if (
      !NETWORK_ID_TO_CHAIN_ID_MAP[chainId] ||
      !tx['from'] ||
      !tx['transactionHash'] ||
      !tx['status'] ||
      typeof tx['updatedAt'] === 'undefined' ||
      typeof tx['value'] === 'undefined' ||
      typeof tx['gas'] === 'undefined' ||
      typeof tx['gasPrice'] === 'undefined'
    ) {
      throw new Error('Invalid activity data')
    }

    return {
      blockTimestamp: null,
      chainId: NETWORK_ID_TO_CHAIN_ID_MAP[chainId],
      data: '',
      from: tx['from'],
      gasLimit: toHex(tx['gas']),
      gasPrice: toHex(tx['gasPrice']),
      hash: tx['transactionHash'],
      id: tx['transactionHash'],
      nonce: toHex(tx['nonce']),
      status: tx['status'],
      time: new Date(tx['updatedAt']).getTime(),
      to: tx['to'],
      txDetails: !tx['data']
        ? {}
        : {
            amount: tx['data']['value'],
            from: tx['from'],
            method: tx['data']['method'],
            to: tx['to'],
            type: 'token',
            currency: tx['data']['symbol']
          },
      txReceipt: {
        gasUsed: toHex(tx['gasUsed'])
      },
      value: toHex(tx['value'])
    }
  } catch (error) {
    logErr({ error })
  }
}

const initializeStorageData = async () => {
  try {
    const extensionStore = new ExtensionStore()
    const data = await extensionStore.get()
    forOwn(STORAGE_KEYS, (value, _) => {
      if (isUndefined(data[value]) || isNull(data[value])) {
        log(`${value} isn't exists, init data`)
        extensionStore.set({ [value]: {} })
        data[value] = {}
      }
    })
    log('initializeStorageData', data)
    return data
  } catch (error) {
    logErr({ error })
  }
}

const migrateNFTs = async () => {
  log('==== MIGRATE NFTS ====')
  try {
    const extensionStore = new ExtensionStore()
    const data = await extensionStore.get()
    const nftsData = data[STORAGE_KEYS.NFTS]
    if (nftsData) {
      forOwn(nftsData, (chainLevel, chainId) => {
        forOwn(chainLevel, (userAddressLevel, userAddress) => {
          forOwn(userAddressLevel, async (contractAddressLevel, contractAddress) => {
            const { items, name } = contractAddressLevel
            var contract = { items: items || {}, name: name || '' }
            forOwn(contractAddressLevel, (item, itemId) => {
              if (parseInt(itemId)) {
                // move nft item from CONTRACT ADDRESS level into ITEMS level
                contract['items'][itemId] = item
              }
            })
            nftsData[chainId][userAddress][contractAddress] = contract
            await extensionStore.set({ [STORAGE_KEYS.NFTS]: nftsData })
          })
        })
      })
    }
  } catch (error) {
    logErr({ error })
  }
}

const refactorContacts = async () => {
  log('==== REFACTOR CONTACTS ====')
  try {
    const extensionStore = new ExtensionStore()
    const data = await extensionStore.get()
    const contacts = data[STORAGE_KEYS.CONTACTS]
    delete contacts.first
    await extensionStore.set({ [STORAGE_KEYS.CONTACTS]: contacts })
  } catch (error) {
    logErr({ error })
  }
}

export { activitiesToTransactions, convertTx, initializeStorageData, migrateNFTs, refactorContacts }
