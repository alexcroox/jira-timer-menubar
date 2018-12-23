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
  padding: 4px 10px;
  margin-bottom: 0;
  line-height: 1.4;
  font-size: 12px;
  letter-spacing: 0.03em;
  white-space: nowrap;
  border: 1px solid transparent;
  border-radius: 3.01px;
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
    background-color: ${props => props.theme.darkMode ? props.theme.dark.buttonBackground : '#ebecf0' };
    color: ${props => props.theme.darkMode ? props.theme.dark.secondaryColor : '#505f79' };

    &:hover {
      background-color: ${props => props.theme.darkMode ? props.theme.dark.inputBackground : '#505f79' };
      color: #FFF;
    }
  `}

  ${props => (props.primary) && css`
    background-color: #0052cc;
    color: #fff;

    &:hover {
      background-color: #0065ff;
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
    background-color: ${props => props.theme.darkMode ? props.theme.dark.inactiveColor : '#ebecf0' };
    color: ${props => props.theme.darkMode ? props.theme.dark.color : '#999' };

    &:hover {
      cursor: not-allowed;
      background-color: #ebecf0;
    }
  `}
`

export default Button
