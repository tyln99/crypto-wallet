import { convertTx } from './storage-migrations'

describe('storage migrations', () => {
  describe('convertTx', () => {
    it('should not return if input is invalid', () => {
      expect(() => convertTx(null, 'invalid chain')).not.toThrow('Invalid activity data')
    })

    it('should return converted tx', () => {
      const tx = {
        currency: 'BNB',
        data: {
          contract: '0xA5009F895064ADffb8959B795bF138a80cCD5339',
          decimals: false,
          method: 'createMarketItem',
          params: ['0x3529c96bEefC40AD6A6AdA8361b2D85717d9E0A4', 83, '20000000000000000'],
          symbol: '',
          value: 1
        },
        from: '0xc871a6abc90ceba7a626eea46e0c2936f2eb7293',
        gas: 167142,
        gasPrice: '10000000000',
        nonce: 948,
        status: 'pending',
        to: '0xA5009F895064ADffb8959B795bF138a80cCD5339',
        transactionHash: '0x3adf365dfeb6779ad5c1fc064fdfcd96240adeaa680a935d25cdffcad7280cb4',
        updatedAt: 'Fri Jul 29 2022 18:09:22 GMT+0700 (Indochina Time)',
        value: 0
      }
      const chainId = '97'
      const convertedTx = convertTx(tx, chainId)
      expect(convertedTx).toEqual({
        blockTimestamp: null,
        chainId: '0x61',
        data: '',
        from: '0xc871a6abc90ceba7a626eea46e0c2936f2eb7293',
        gasLimit: '0x28ce6',
        gasPrice: '0x2540be400',
        hash: '0x3adf365dfeb6779ad5c1fc064fdfcd96240adeaa680a935d25cdffcad7280cb4',
        id: '0x3adf365dfeb6779ad5c1fc064fdfcd96240adeaa680a935d25cdffcad7280cb4',
        nonce: '0x3b4',
        status: 'pending',
        time: 1659092962000,
        to: '0xA5009F895064ADffb8959B795bF138a80cCD5339',
        txDetails: {
          amount: 1,
          currency: '',
          from: '0xc871a6abc90ceba7a626eea46e0c2936f2eb7293',
          method: 'createMarketItem',
          to: '0xA5009F895064ADffb8959B795bF138a80cCD5339',
          type: 'token'
        },
        txReceipt: {
          gasUsed: undefined
        },
        value: '0x0'
      })
    })
  })
})
