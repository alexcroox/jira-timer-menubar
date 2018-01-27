import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const IconLink = styled(Link)`
  color: #6B6B6B;
  position: relative;
  z-index: 1;
  font-size: 17px;

  &:hover {
    color: #333;
    cursor: pointer;
  }
`

export default IconLink
