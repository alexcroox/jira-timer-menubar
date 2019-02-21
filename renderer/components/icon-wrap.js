import React from 'react'
import styled, { css } from 'styled-components'

const IconWrap = styled.div`
  & > :not(first-child) {
    margin-left: 1em;
  }
`
export default IconWrap
