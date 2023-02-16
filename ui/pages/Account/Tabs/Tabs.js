import React from 'react'
import { Col, Nav, Row, Tab } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import AssetCard from '@components/AssetCard'
import ActivityCard from '@components/ActivityCard'
import { fromWei } from '@shared/util/converter'
import ListNFTs from '@components/ListNFTs'
import bnbIcon from '@resources/images/bnb.svg'
import ethIcon from '@resources/images/eth.svg'
import logo from '@resources/images/logo.svg'
import { TAB_KEYS } from '../Account'
import { IMPORT_NFT_ROUTE, IMPORT_TOKEN_ROUTE } from '@shared/constant/routes'
import { useTranslation } from 'react-i18next'

export default function Tabs({
  onTabChange,
  currentTab,
  onSelectCoinAsset,
  selectedNetwork,
  selectedAccount,
  tokens,
  onSelectTokenAsset,
  listNFTs,
  activities,
  setShowPreview,
  setSelectedActivity
}) {
  const { t } = useTranslation()
  return (
    <div className="assets-container">
      <Tab.Container onSelect={onTabChange} defaultActiveKey={currentTab}>
        <Col>
          <Row>
            <Nav variant="pills">
              <Nav.Item>
                <Nav.Link eventKey={TAB_KEYS.ASSETS}>{t('Tokens')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={TAB_KEYS.NFT}>{t('NFTs')}</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey={TAB_KEYS.ACTIVITIES}>{t('Activities')}</Nav.Link>
              </Nav.Item>
            </Nav>
          </Row>
          <Row>
            <Tab.Content>
              <Tab.Pane eventKey={TAB_KEYS.ASSETS}>
                <AssetCard
                  onSelect={onSelectCoinAsset}
                  logo={selectedNetwork.currency === 'BNB' ? bnbIcon : ethIcon}
                  balance={selectedAccount.balance || 0}
                  currency={selectedNetwork.currency}
                />
                {Array.isArray(tokens) &&
                  tokens.map((tk, index) => {
                    if (tk) {
                      return (
                        <AssetCard
                          key={index}
                          onSelect={() => onSelectTokenAsset(tk)}
                          logo={logo}
                          balance={fromWei(tk.balance)}
                          currency={tk.symbol}
                        />
                      )
                    } else {
                      return <div key={index}></div>
                    }
                  })}
                <div className="import-account-link-container">
                  <p>{t(`Don't see your token?`)}</p>
                  <Link to={IMPORT_TOKEN_ROUTE}>{t(`Import token`)}</Link>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey={TAB_KEYS.NFT}>
                <ListNFTs data={listNFTs} />
                <div className="import-account-link-container">
                  <p>{t(`Don't see your NFT?`)}</p>
                  <Link to={IMPORT_NFT_ROUTE}>{t('Import NFT')}</Link>
                </div>
              </Tab.Pane>
              <Tab.Pane eventKey={TAB_KEYS.ACTIVITIES}>
                <div className="activities-container scrollbar__enabled">
                  {activities &&
                    activities.map((item, index) => {
                      return (
                        <ActivityCard
                          key={index}
                          activity={item}
                          networkCurrency={selectedNetwork.currency}
                          onClick={() => {
                            setShowPreview(true)
                            setSelectedActivity(item)
                          }}
                        />
                      )
                    })}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Row>
        </Col>
      </Tab.Container>
    </div>
  )
}
