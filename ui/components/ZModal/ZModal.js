import { ZButton } from '@components/ZButtons'
import React from 'react'
import { Modal } from 'react-bootstrap'
import './styles.scss'

function ZModal({
  show,
  title,
  children,
  onSubmit,
  onCancel,
  okText = 'Send',
  cancelText = 'Close',
  isShowControlButtons = true,
  className
}) {
  return (
    <Modal show={show} onHide={onCancel} className={`zModal ${className}`}>
      <Modal.Header closeButton>
        <Modal.Title className="title">{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      {isShowControlButtons && (
        <Modal.Footer>
          <ZButton className="secondary" onClick={onCancel}>
            {cancelText}
          </ZButton>
          <ZButton onClick={onSubmit}>{okText}</ZButton>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default ZModal
