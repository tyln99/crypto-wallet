import extension from './extensionizer'
//**path: home.html, popup.html,notofication.html... */
import {
  ENV_TYPE_POPUP,
  ENV_TYPE_NOTIFICATION,
  ENV_TYPE_FULLSCREEN,
  PLATFORM_FIREFOX,
  PLATFORM_OPERA,
  PLATFORM_CHROME,
  PLATFORM_EDGE
} from '../../../shared/constant/app'

/**
 * Returns the window type for the application
 *
 *  - `popup` refers to the extension opened through the browser app icon (in top right corner in chrome and firefox)
 *  - `fullscreen` refers to the main browser window
 *  - `notification` refers to the popup that appears in its own window when taking action outside of metamask
 *  - `background` refers to the background page
 *
 * NOTE: This should only be called on internal URLs.
 *
 * @param {string} [url] - the URL of the window
 * @returns {string} the environment ENUM
 */
const getEnvironmentType = (path = window.location.href) => {
  if (!path) {
    return ''
  }
  if (path.indexOf('/home.html') > 0) {
    return ENV_TYPE_FULLSCREEN
  } else if (path.indexOf('/popup.html') > 0 || path.indexOf('/index.html') > 0) {
    return ENV_TYPE_POPUP
  } else if (path.indexOf('/notification.html') > 0) {
    return ENV_TYPE_NOTIFICATION
  }
  return ''
}

/**
 * Returns the platform (browser) where the extension is running.
 *
 * @returns {string} the platform ENUM
 */
const getPlatform = () => {
  const { navigator } = window
  const { userAgent } = navigator

  if (userAgent.includes('Firefox')) {
    return PLATFORM_FIREFOX
  } else if (userAgent.includes('Edg/')) {
    return PLATFORM_EDGE
  } else if (userAgent.includes('OPR')) {
    return PLATFORM_OPERA
  }
  // else if ('brave' in navigator) {
  //   return PLATFORM_BRAVE
  // }
  return PLATFORM_CHROME
}

/**
 * Returns an Error if extension.runtime.lastError is present
 * this is a workaround for the non-standard error object that's used
 *
 * @returns {Error|undefined}
 */
function checkForError() {
  const { lastError } = extension.runtime
  if (!lastError) {
    return undefined
  }
  // if it quacks like an Error, its an Error
  if (lastError.stack && lastError.message) {
    return lastError
  }
  // repair incomplete error object (eg chromium v77)
  return new Error(lastError.message)
}

export { getEnvironmentType, checkForError, getPlatform }
