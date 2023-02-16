//TODO: setblobal lib, comunication with background via contentscript
import initializeProvider from './lib/initializeProvider'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import { CONTENTSCRIPT, INPAGE } from '@shared/constant/app'
// setup background connection
const zwalletStream = new WindowPostMessageStream({
  name: INPAGE,
  target: CONTENTSCRIPT
})

initializeProvider({
  connectionStream: zwalletStream
})
