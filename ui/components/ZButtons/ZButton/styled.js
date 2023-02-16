import styled from 'styled-components'

export const Button = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 12px 24px;
  gap: 8px;
  isolation: isolate;
  width: 222px;
  height: 48px;
  background: var(--color-zwallet);
  border-radius: 100px;
  border: none;
  outline: none;

  font-style: normal;
  font-weight: 500;
  font-size: 15px;
  line-height: 20px;
  text-align: center;
  color: #ffffff;

  &.secondary {
    background: #e9f5ff;
    color: var(--color-zwallet);
  }

  &.danger {
    background: #ffb0ad;
    color: var(--color-error);
  }
`
