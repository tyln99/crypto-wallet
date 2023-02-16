import styled from 'styled-components'

export const AssetCardStyled = styled.div`
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: left;
  color: grey;
  cursor: pointer;
  position: relative;
  border-bottom: 0.5px solid var(--color-border-extra-light);

  :hover {
    background-color: #dbdbdb;
  }

  img {
    width: 40px;
    height: 40px;
    margin-right: 10px;
  }
  .left-icon {
    position: absolute;
    right: 20px;
  }
`
