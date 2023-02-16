//TODO: inject inpage script, setup stream to inpage and background (brigde connection)
import { CONTENTSCRIPT, INPAGE } from '../../shared/constant/app'
import extensionizer from './lib/extensionizer'
import { WindowPostMessageStream } from '@metamask/post-message-stream'
import pump from 'pump'
import ObjMultiplex from 'obj-multiplex'
import PortStream from 'extension-port-stream'
import { log } from '@shared/util/logger'

injectScript()
setupStreams()

/**
 * Injects a script tag into the current document
 *
 * @param {string} content - Code to be executed in the current document
 */
function injectScript() {
  var s = document.createElement('script')
  s.src = extensionizer.runtime.getURL('inpage.js')
  ;(document.head || document.documentElement).appendChild(s)
  s.parentNode.removeChild(s) //remove in html
}

/**
 * Sets up two-way communication streams between the
 * browser extension and local per-page browser context.
 *
 */
function setupStreams() {
  const pageStream = new WindowPostMessageStream({
    name: CONTENTSCRIPT,
    target: INPAGE
  })
  const pageMux = new ObjMultiplex()
  pump(pageStream, pageMux, pageStream, function(err) {
    log('CONTENTSCRIPT Connection error:', err)
  })
  //connect to BG
  let extensionPort = extensionizer.runtime.connect({ name: CONTENTSCRIPT })
  const connectionStream = new PortStream(extensionPort)
  const extensionMux = new ObjMultiplex()
  pump(connectionStream, extensionMux, connectionStream, (err) => {
    //if (err) {
    log('Lost connect CONTENTSCRIPT <-> BG', err)
    //}
  })
  // forward communication across inpage-background for these channels only
  forwardTrafficBetweenMuxes('zwallet-provider', pageMux, extensionMux)
}

function forwardTrafficBetweenMuxes(channelName, muxA, muxB) {
  const channelA = muxA.createStream(channelName)
  const channelB = muxB.createStream(channelName)
  pump(channelA, channelB, channelA, (error) =>
    console.debug(`MetaMask: Muxed traffic for channel "${channelName}" failed.`, error)
  )
}
