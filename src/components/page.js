import React from 'react'
import styled, { css } from 'styled-components'

const Page = styled.div`
  border-radius: 6px;
  color: ${props => props.theme.darkMode ? props.theme.dark.color : 'inherit' };
  background-color: ${props => props.theme.darkMode ? props.theme.dark.backgroundColor : 'inherit' };
`

export default Page
