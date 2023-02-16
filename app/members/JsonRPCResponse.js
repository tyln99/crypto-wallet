const jsonrpc = '2.0'

class JsonRPCResponse {
  constructor({ result = null, error = null }) {
    // this.id = 0;
    this.jsonrpc = jsonrpc
    this.result = result
    this.error = error
  }

  setResult(result) {
    this.result = result
  }

  setError(error) {
    this.error = error
  }

  setErrorObject({ code, message, data }) {
    this.setError({ code, message, data })
  }

  toObject() {
    return { jsonrpc: this.jsonrpc, result: this.result, error: this.error }
  }

  stringify() {
    return JSON.stringify(this.toObject())
  }
}

export default JsonRPCResponse
