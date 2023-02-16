import { generateERC20TransferData, generateFunctionData } from './send.utils'
import { toHex } from 'web3-utils'
import { toWei } from './converter'

describe('Send utils', () => {
  describe('generateERC20TransferData', () => {
    it('should throw error if params invalid', () => {
      expect(() => generateERC20TransferData({})).toThrow()
    })
    it('should return encoded transfer data', () => {
      expect(generateERC20TransferData('0x66aD13766007b509eeAD1E555dadC046DEC81dcb', '0')).toBe(
        '0xa9059cbb00000000000000000000000066ad13766007b509eead1e555dadc046dec81dcb0000000000000000000000000000000000000000000000000000000000000000'
      )
    })
  })

  describe('generateFunctionData', () => {
    it('should throw error if params invalid', () => {
      expect(() => generateFunctionData({})).toThrow()
    })

    it('should return encoded data', () => {
      expect(
        generateFunctionData({
          abiItem: {
            name: 'transfer',
            type: 'function',
            inputs: [
              {
                name: '_to',
                type: 'address'
              },
              {
                name: '_value',
                type: 'uint256'
              }
            ]
          },
          params: ['0x66aD13766007b509eeAD1E555dadC046DEC81dcb', `${toHex(toWei('0'))}`]
        })
      ).toBe(
        '0xa9059cbb00000000000000000000000066ad13766007b509eead1e555dadc046dec81dcb0000000000000000000000000000000000000000000000000000000000000000'
      )
    })
  })
})
