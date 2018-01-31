import React from 'react'
import styled, { css } from 'styled-components'

const LargeIcon = styled.span`
  font-size: 16px;

  ${props => (props.clickable) && css`
    &:hover {
      color: #333;
      cursor: pointer;
    }
  `}
`

export default LargeIcon
