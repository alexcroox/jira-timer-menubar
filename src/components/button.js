import React from 'react'
import styled, { css } from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'

const Button = (props) => (
  <ButtonStyled {...props}>
    {props.children}
  </ButtonStyled>
)

export const ButtonIcon = styled(FontAwesomeIcon)`
  margin-right: 7px;
`

const ButtonStyled = styled.span`
  display: inline-block;
  padding: 3px 8px;
  margin-bottom: 0;
  line-height: 1.4;
  font-size: 12px;
  letter-spacing: 0.03em;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 4px;
  box-shadow: 0 1px 1px rgba(0,0,0,.06);
  position: relative;
  z-index: 1;

  &:hover {
    cursor: pointer;
  }

  ${props => (props.inline) && css`
    text-decoration: underline;
  `}

  ${props => (props.large) && css`
    padding: 6px 12px;
  `}

  ${props => (props.default) && css`
    border-color: #c2c0c2 #c2c0c2 #a19fa1;
    background-color: #fcfcfc;
    background-image: linear-gradient(to bottom,#fcfcfc 0,#f1f1f1 100%);
    color: #333;

    &:hover {
      background-color: #ddd;
      background-image: none;
    }
  `}

  ${props => (props.primary) && css`
    text-shadow: 0 1px 1px rgba(0,0,0,.1);
    border-color: #388df8 #388df8 #0866dc;
    background-color: #6eb4f7;
    background-image: linear-gradient(to bottom,#6eb4f7 0,#1a82fb 100%);
    color: #fff;

    &:hover {
      background-color: #3e9bf4;
      background-image: linear-gradient(to bottom,#3e9bf4 0,#0469de 100%);
    }
  `}

  ${props => (props.positive) && css`
    text-shadow: 0 1px 1px rgba(0,0,0,.3);
    border-color: #29a03b #29a03b #248b34;
    background-color: #5bd46d;
    background-image: linear-gradient(to bottom,#5bd46d 0,#29a03b 100%);
    color: #fff;

    &:hover {
      background-color: #34c84a;
      background-image: linear-gradient(to bottom,#34c84a 0,#248b34 100%);
    }
  `}

  ${props => (props.loading) && css`
    background-color: #ddd;
    background-image: none;
    border-color: #c2c0c2 #c2c0c2 #a19fa1;
    color: #333;

    &:hover {
      cursor: default;
      background-color: #ddd;
      background-image: none;
    }
  `}
`

export default Button
