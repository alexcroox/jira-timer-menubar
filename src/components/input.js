import React from 'react'
import styled, { css } from 'styled-components'

const Input = styled.input`
  width: 100%;
  min-height: 25px;
  padding: 5px 10px;
  line-height: 1.6;
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 4px;
  outline: 0;
  display: inline-block;
  font-size: 13px;

  ${props => (props.straight) && css`
    border-radius: 0px;
  `}
`

export default Input
