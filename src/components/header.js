import { ipcRenderer } from 'electron'
import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import PropTypes from 'prop-types'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faAngleLeft from '@fortawesome/fontawesome-free-solid/faAngleLeft'
import faPowerOff from '@fortawesome/fontawesome-free-solid/faPowerOff'
import faPlus from '@fortawesome/fontawesome-free-solid/faPlus'
import Button, { ButtonIcon } from './button'
import IconLink from './icon-link'
import IconWrap from './icon-wrap'

class Header extends Component {
  constructor(props) {
    super(props)
  }

  onQuitApp () {
    ipcRenderer.send('quit')
  }

  render() {
    return (
      <Fragment>
        <HeaderStyled>

          {this.props.withCreateTaskButton && (
            <Link to="/create-task">
              <Button default withIcon>
                <ButtonIcon icon={faPlus} />
                New task
              </Button>
            </Link>
          )}

          {this.props.withBackButton && (
            <IconLink large to="/dashboard">
              <FontAwesomeIcon icon={faAngleLeft} />
            </IconLink>
          )}

          <Title>{this.props.titleText}</Title>

          {this.props.withExitButton && (
            <IconWrap>
              <IconLink to='/dashboard' onClick={this.onQuitApp}>
                <FontAwesomeIcon icon={faPowerOff} />
              </IconLink>
            </IconWrap>
          )}

        </HeaderStyled>
      </Fragment>
    )
  }
}

Header.propTypes = {
  titleText: PropTypes.string.isRequired
}

const HeaderStyled = styled.div`
  background: ${props => props.theme.darkMode ? props.theme.dark.backgroundColor : '#FFF' };
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-left: 10px;
  padding-right: 10px;
  border-bottom: 1px solid ${props => props.theme.darkMode ? props.theme.dark.border : '#D7D7D7' };
  border-radius: 6px 6px 0 0;
`

const Title = styled.span`
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 0;
  font-weight: 500;
  color: ${props => props.theme.darkMode ? props.theme.dark.color : '#000' };
`

export default Header
