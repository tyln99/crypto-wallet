import React, { useContext } from 'react'
import { AuthContext } from '@providers/AuthProvider'
import { Redirect, useHistory } from 'react-router'

function RequireAuth({ children }) {
  const authContext = useContext(AuthContext)
  const history = useHistory()

  if (!authContext.unlocked) {
    // Redirect them to the /login page, but save the current location they were
    // along to that page after they login, which is a nicer user experience
    // trying to go to when they were redirected. This allows us to send them
    // than dropping them off on the home page.
    return <Redirect to="/login" state={{ from: history }} replace />
  }

  return children
}

export default RequireAuth
