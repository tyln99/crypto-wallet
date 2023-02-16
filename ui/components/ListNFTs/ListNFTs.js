import React from 'react'
import { Accordion } from 'react-bootstrap'

import { formatAddress } from '@shared/util/string'
import './ListNFTs.scss'
import ZTooltip from '../ZTooltip'

function ListNFTs({ data }) {
  return (
    <div className="list-nfts">
      {data && (
        <Accordion alwaysOpen>
          {Object.keys(data).map((contractAddress) => {
            const name = data[contractAddress]?.name
            const items = data[contractAddress]?.items

            return (
              <Accordion.Item
                key={contractAddress}
                eventKey={contractAddress}
                className="nft-container"
              >
                <Accordion.Header className="nft-addr">
                  {name || formatAddress(contractAddress)}
                </Accordion.Header>
                <Accordion.Body className="items">
                  {items &&
                    Object.keys(items).map((id) => {
                      const metadata = items[id]?.metadata
                      const img = metadata?.image
                      const name = metadata?.name
                      return (
                        <div key={id} className="nft-item">
                          {img ? (
                            <ZTooltip content={name} disabled={!name}>
                              <img alt="" src={img} />
                            </ZTooltip>
                          ) : (
                            `#${id}`
                          )}
                        </div>
                      )
                    })}
                </Accordion.Body>
              </Accordion.Item>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}

export default ListNFTs
