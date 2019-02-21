import React from 'react'
import styled from 'styled-components'

const Divider = styled.div`
  display: block;
  height: 1px;
  margin: 20px 10px;
  background-color: ${props => props.theme.darkMode ? props.theme.dark.borderLighter : '#CCC' };
`

export default Divider
