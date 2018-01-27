import React from 'react'
import styled, { css } from 'styled-components'

const FormHelperText = styled.span`
  display: block;
  font-size: 12px;
  margin-top: 5px;
  color: #888;
  font-style: italic;

  ${props => (props.error) && css`
    color: red;
    font-style: normal;
  `}
`

export default FormHelperText
