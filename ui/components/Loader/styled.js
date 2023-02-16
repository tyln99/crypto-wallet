const { default: styled, css } = require('styled-components')

export const DarkBackground = styled.div`
  display: none; /* Hidden by default */
  position: fixed; /* Stay in place */
  z-index: 999; /* Sit on top */
  left: 0;
  top: 0;
  width: 100%; /* Full width */
  height: 100%; /* Full height */
  overflow: auto; /* Enable scroll if needed */
  background: rgba(0, 0, 0, 0.15);

  ${(props) =>
    props.appear &&
    css`
      display: block; /* show */
    `}
`
