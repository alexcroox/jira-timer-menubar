import React from 'react'
import styled from 'styled-components'

const Checkbox = (props) => (
  <CheckboxLabel>
    {props.label}
    <CheckboxInput type="checkbox" checked={props.checked} onChange={props.onChange} />
    <CheckboxMark />
  </CheckboxLabel>
)

const CheckboxInput = styled.input`
  position: absolute;
  opacity: 0;
  cursor: pointer;
`

const CheckboxMark = styled.span`
  position: absolute;
  top: 0;
  left: 0;
  height: 20px;
  width: 20px;
  background-color: #eee;

  &:after {
    content: "";
    position: absolute;
    display: none;
    left: 7px;
    top: 3px;
    width: 3px;
    height: 9px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
`

const CheckboxLabel = styled.label`
  display: inline-block;
  position: relative;
  padding-left: 30px;
  line-height: 22px;
  cursor: pointer;
  user-select: none;

  &:hover ${CheckboxInput} ~ ${CheckboxMark} {
    background-color: #CCC;
  }

  & > ${CheckboxInput}:checked ~ ${CheckboxMark} {
    background-color: #2196F3;
  }

  & > ${CheckboxInput}:checked ~ ${CheckboxMark}:after {
    display: block;
  }
`

export default Checkbox
