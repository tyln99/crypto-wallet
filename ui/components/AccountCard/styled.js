import styled from 'styled-components'

export const AccountCardStyled = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 16px 16px 30px;
  color: black;
  text-decoration: none;
  width: 400px;
  max-width: 100%;
  margin-bottom: 10px;
  cursor: pointer;
  text-align: left;
  position: relative;
  border-radius: 12px;

  :hover {
    background-color: rgba(160, 196, 229, 0.4);
  }

  .info {
    width: 65%;
    margin-left: 10px;
  }

  .name {
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;
    color: var(--color-text-dark);
  }

  .balance {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
    color: var(--color-text-light);
  }

  .suffix {
    position: absolute;
    right: 20px;
    font-size: 11px;
    padding: 5px 10px;
    border-radius: 10px;
    background: #a1a1a16e;
    color: #fff;
  }

  .avatar {
    height: 35px;
  }

  .account-activated {
    position: absolute;
    left: 10px;
    color: var(--green400);
  }
`
