import React, { Component } from 'react'
import styled, { css } from 'styled-components'

class EditTime extends Component {
  constructor(props) {
    super(props)

    this.state = {
      editedTime: ''
    }

    this.onResetEditTime = this.onResetEditTime.bind(this)
    this.onKeyPress = this.onKeyPress.bind(this)
    this.onChange = this.onChange.bind(this)
  }

  onKeyPress (e) {
    if (e.key === 'Enter')
      this.props.onTimeChanged(this.props.timeId, this.state.editedTime)

    if (e.key === 'Escape')
      this.onResetEditTime()
  }

  onChange (event) {
    this.setState({ editedTime: event.target.value })
  }

  onResetEditTime () {
    this.setState({ editedTime: '' })
    this.props.onResetEditTime()
  }

  render() {
    return (
      <EditTimeStyled
        {...this.props}
        autoFocus
        value={this.state.editedTime}
        onChange={this.onChange}
        onKeyUp={this.onKeyPress}
      />
    )
  }
}

const EditTimeStyled = styled.input`
  background: none;
  border: none;
  color: #FFF;
  outline: none;
  width: 50px;
  font-weight: 500;
  letter-spacing: 0.04em;
  font-size: 13px;

  &::placeholder {
    color: #FFF;
    font-style: italic;
  }

  ${props => (props.worklog) && css`
    border: 1px solid #CCC;
    border-radius: 4px;
    color: #666;
    font-size: 12px;
    padding: 2px 5px;
    width: 63px;

    &::placeholder {
      color: #CCC;
    }
  `}
`

export default EditTime
