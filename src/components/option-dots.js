import React from 'react'
import styled, { css } from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faEllipsisH from '@fortawesome/fontawesome-free-solid/faEllipsisH'

const OptionDots = (props) => (
  <OptionDotsStyled
    icon={faEllipsisH}
    {...props}
  />
)

export const OptionDotsStyled = styled(FontAwesomeIcon)`
  font-size: 23px;
  margin-left: 15px;
  color: #FFF;

  &:hover {
    cursor: pointer;
    opacity: 0.8;
  }
`
export default OptionDots
