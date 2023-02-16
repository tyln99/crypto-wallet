const { GOOGLE_QR_CHART_API_URL } = require('@shared/config/google-api')

const DEFAULT_RATIO = '240x240'

const generateQRCode = (link, ratio = DEFAULT_RATIO) => {
  return `${GOOGLE_QR_CHART_API_URL}${link}&chs=${ratio}&chld=L|0`
}

export { generateQRCode }
