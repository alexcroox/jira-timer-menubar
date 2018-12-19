import React from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const IconLink = styled(Link)`
  color: ${props => props.theme.darkMode ? props.theme.darkSecondaryColor : '#6B6B6B' };
  position: relative;
  z-index: 1;
  font-size: 17px;

  &:hover {
    color: #333;
    cursor: pointer;
  }

  ${props => (props.large) && css`
    font-size: 24px;
  `}
`

export default IconLink
