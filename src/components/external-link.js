import React, { Component } from 'react'
import styled from 'styled-components'

class ExternalLink extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <Link>
        {this.props.children}
      </Link>
    )
  }
}

const Link = styled.a`
  text-decoration: underline;
  display: inline-block;

  &:hover {
    cursor: pointer;
  }
`

export default ExternalLink
