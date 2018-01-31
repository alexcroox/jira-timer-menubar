import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

class FooterContainer extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <FooterStyled>
        {this.props.children}
      </FooterStyled>
    )
  }
}

const FooterStyled = styled.div`
  background: #EAEAEA;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding-left: 10px;
  padding-right: 10px;
  border-top: 1px solid #D0D0D0;
  border-radius: 0 0 6px 6px;
`

const mapStateToProps = state => ({
  authToken: state.user.authToken,
})

export default connect(mapStateToProps)(FooterContainer)
