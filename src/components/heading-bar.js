import React from 'react'
import styled, { css } from 'styled-components'
import { Link } from 'react-router-dom'

const HeadingBar = styled.div`
  background-color: rgba(234,234,234,0.9);
  color: #999;
  font-weight: 500;
  padding: 8px 10px 7px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  font-size: 12px;

  ${props => (props.borderBottom) && css`
    border-bottom: 1px solid #DADADA;
  `}

  ${props => (props.borderTop) && css`
    border-top: 1px solid #DADADA;
  `}
`

export default HeadingBar
