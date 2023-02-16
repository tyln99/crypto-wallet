import React from 'react'
import { AssetCardStyled } from './styled'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAngleRight } from '@fortawesome/free-solid-svg-icons'
import { formatBalance } from '@shared/util/string'

const AssetCard = ({ logo, balance, currency, onSelect }) => {
  return (
    <AssetCardStyled onClick={onSelect}>
      <img src={logo} alt="" />
      <p>{formatBalance(balance, currency)}</p>
      <FontAwesomeIcon className="left-icon" icon={faAngleRight} />
    </AssetCardStyled>
  )
}

export default AssetCard
