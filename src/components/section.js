import React from 'react'
import styled, { css } from 'styled-components'

const Section = styled.div`
  padding: 10px;

  ${props => (props.noPaddingTop) && css`
    padding-top: 0px;
  `}
`

export default Section
