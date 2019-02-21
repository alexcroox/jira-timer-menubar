import React from 'react'
import styled from 'styled-components'

const Label = styled.label`
  display: inline-block;
  font-size: 13px;
  width: 100%;
  margin-bottom: 5px;
  color: ${props => props.theme.darkMode ? props.theme.dark.color : '#333' };
`

export default Label
