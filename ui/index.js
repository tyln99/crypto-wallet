import React from 'react'
import ReactDOM from 'react-dom'
import { HashRouter } from 'react-router-dom'
import * as Sentry from '@sentry/react'
import App from './App'

// REDUX
import { Provider } from 'react-redux'
import configureStore from './store/index'
import '@resources/scss/index.scss'
import Error from '@pages/Error'
import '@resources/images/logo128x128.png'
import '@resources/images/logo48x48.png'
import '@resources/images/logo16x16.png'

export default function launchUi(options) {
  const store = configureStore()

  ReactDOM.render(
    <React.StrictMode>
      <Provider store={store}>
        <HashRouter hashType="noslash" basename="/">
          <Sentry.ErrorBoundary fallback={<Error />}>
            <App options={options} />
          </Sentry.ErrorBoundary>
        </HashRouter>
      </Provider>
    </React.StrictMode>,
    options.container
  )
}
