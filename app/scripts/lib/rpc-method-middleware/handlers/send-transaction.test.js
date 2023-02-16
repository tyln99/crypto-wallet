import sendTransaction from './send-transaction'
const { MOCK_USER_ADDR } = require('../../../../../test/mocks/tx')

describe('sendTransaction', () => {
  const { implementation } = sendTransaction
  let mockEnd
  let mockReq
  let nonce
  let mockRes

  beforeEach(() => {
    mockEnd = (err) => {
      throw err
    }

    mockReq = {
      origin: 'https://google.com',
      id: 123,
      params: [
        {
          from: MOCK_USER_ADDR,
          to: '0xc871a6abc90ceba7a626eea46e0c2936f2eb7293',
          value: '10000000000',
          gas: '21000',
          gasPrice: '10'
        }
      ]
    }
    nonce = () => null

    mockRes = {
      result: null
    }
  })

  it('should throw method not support if not specify sendTransaction method', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getAccounts: nonce,
        sendTransaction: null
      })
    ).rejects.toThrow('Method not supported.')
  })

  it('should throw opts.getPermission is required', async () => {
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: null,
        sendTransaction: nonce
      })
    ).rejects.toThrow('opts.getPermission is required')
  })

  it('should throw invalid address if from address invalid', async () => {
    mockReq.params = [{ from: 'abcd' }]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid address abcd`)
  })

  it('should throw invalid address if to address invalid', async () => {
    mockReq.params = [{ from: MOCK_USER_ADDR, to: 'abcd' }]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid address abcd`)
  })

  it('should throw invalid value', async () => {
    mockReq.params = [
      { from: MOCK_USER_ADDR, to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb', value: null }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid amount value null`)
  })

  it('should throw invalid gas', async () => {
    mockReq.params = [
      {
        from: MOCK_USER_ADDR,
        to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb',
        value: '10000000000',
        gas: null
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid gas value null`)
  })

  it('should throw invalid gasPrice', async () => {
    mockReq.params = [
      {
        from: MOCK_USER_ADDR,
        to: '0x66aD13766007b509eeAD1E555dadC046DEC81dcb',
        value: '10000000000',
        gas: '21000',
        gasPrice: null
      }
    ]
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: nonce,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid gasPrice value null`)
  })

  it('should throw must provide an Ethereum address', async () => {
    const getPermission = () => new Promise((resolve, reject) => resolve({}))
    await expect(
      implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: nonce,
        getPermission: getPermission,
        sendTransaction: nonce
      })
    ).rejects.toThrow(`Invalid parameters: must provide an Ethereum address.`)
  })

  it('should send success and return transaction receipt', async () => {
    const getPermission = ({ origin }) => {
      if (origin !== 'https://google.com') {
        return Promise.resolve({})
      }
      return Promise.resolve({
        permissions: {
          eth_accounts: {
            caveats: [{ value: [MOCK_USER_ADDR] }]
          }
        }
      })
    }
    const mockSendTransaction = () =>
      new Promise((resolve, _) => {
        resolve(mockReq.params[0])
      })

    try {
      const mockRequestUserApproval = () =>
        new Promise((resolve, _) => {
          resolve({ txDetails: {}, estimatedGas: 100000, newGasPrice: 20 })
        })
      await implementation(mockReq, mockRes, null, mockEnd, {
        requestUserApproval: mockRequestUserApproval,
        getPermission: getPermission,
        sendTransaction: mockSendTransaction
      })
    } catch (error) {
      console.error(error)
    }

    expect(mockRes.result.from).toBe(MOCK_USER_ADDR)
  })
})
