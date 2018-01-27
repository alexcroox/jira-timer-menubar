import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faCog from '@fortawesome/fontawesome-free-solid/faCog'
import Button from './button'
import IconLink from './icon-link'

class Header extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Fragment>
        {this.props.authenticated ? (
          <HeaderStyled>
            <Button default>New task</Button>

            <Title>{this.props.titleText}</Title>

            <IconLink to="/settings">
              <FontAwesomeIcon icon={faCog} />
            </IconLink>
          </HeaderStyled>
        ) : (
          <HeaderStyled rightAligned>
            <Title>{this.props.titleText}</Title>

            <IconLink to="/settings">
              <FontAwesomeIcon icon={faCog} />
            </IconLink>
          </HeaderStyled>
        )}
      </Fragment>
    )
  }
}

Header.propTypes = {
  titleText: PropTypes.string.isRequired
}

const HeaderStyled = styled.div`
  background: #FFF;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-left: 10px;
  padding-right: 10px;
  border-bottom: 1px solid #D7D7D7;
  border-radius: 6px 6px 0 0;

  ${props => (props.rightAligned) && css`
    flex-direction: row-reverse;
  `}
`

const Title = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 0;
  font-weight: 500;
`

export default Header
