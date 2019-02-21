import React from 'react'
import styled, { css } from 'styled-components'

const Section = styled.div`
  padding: 10px;

  ${props => (props.noPaddingTop) && css`
    padding-top: 0px;
  `}
`

export const SectionTitle = styled.span`
  display: block;
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
`

export default Section
