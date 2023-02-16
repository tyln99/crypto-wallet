import styled from 'styled-components'

export const ActivityCardStyled = styled.div`
  padding: 20px;
  color: black;
  border-bottom: 1px solid var(--color-border-extra-light);
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
  justify-content: space-between;
  line-height: 18px;
  color: var(--color-text-dark);

  .left-container {
    width: 60%;
    font-weight: 500;
    font-size: 16px;
    line-height: 22px;

    div {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .amount {
    display: flex;
    align-items: center;
    justify-content: end;
    text-align: right;

    .value {
      white-space: nowrap;
      max-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 400;
      font-size: 14px;
      line-height: 18px;
    }
  }

  :hover {
    // background-color: #dbdbdb;
  }

  .status {
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
  }
  .status--pending {
    color: var(--grey700);
  }
  .status--approved,
  .status--confirmed {
    color: var(--color-success);
  }
  .status--failed {
    color: var(--color-error);
  }

  .date-to-info {
    color: var(--color-text-light);
    font-weight: 400;
    font-size: 14px;
    line-height: 18px;
  }
`
