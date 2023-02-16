import { EthereumRpcError } from 'eth-rpc-errors'
import ApprovalController from './ApprovalController'

const approvalController = new ApprovalController({
  showApprovalRequest: () => undefined
})

describe('ApprovalController', () => {
  beforeAll(() => {
    approvalController._approvals.set('1', {})
    approvalController._approvals.set('2', {})
    approvalController._approvals.set('3', {})
  })

  describe('addAndShowApprovalRequest', () => {
    it('given id null', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: 'https://google.com',
          type: 'type',
          id: null,
          requestData: {}
        })
      }).toThrow(EthereumRpcError)
    })

    it('given id already exists', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: 'https://google.com',
          type: 'type',
          id: '1',
          requestData: {}
        })
      }).toThrow(EthereumRpcError)
    })

    it('given empty origin', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: null,
          type: 'type',
          id: '4',
          requestData: []
        })
      }).toThrow(EthereumRpcError)
    })

    it('given empty type', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: 'https://google.com',
          type: null,
          id: '4',
          requestData: {}
        })
      }).toThrow(EthereumRpcError)
    })

    it('given invalid requestData', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: 'https://google.com',
          type: 'type',
          id: '4',
          requestData: []
        })
      }).toThrow(EthereumRpcError)
    })

    it('given valid input', () => {
      expect(() => {
        approvalController.addAndShowApprovalRequest({
          origin: 'https://google.com',
          type: 'type',
          id: '4',
          requestData: {}
        })
      }).not.toThrow()
    })
  })

  describe('accept', () => {
    it('given not exists id', () => {
      expect(() => {
        approvalController.accept('1000', {})
      }).toThrow(Error)
    })

    it('given valid id and value', () => {
      expect(() => {
        approvalController.accept('1', {})
      }).toThrow(Error)
    })
  })

  describe('reject', () => {
    it('given not exists id', () => {
      expect(() => {
        approvalController.reject('1000', {})
      }).toThrow(Error)
    })

    it('given valid id and value', () => {
      expect(() => {
        approvalController.reject('1', {})
      }).toThrow(Error)
    })
  })
})
