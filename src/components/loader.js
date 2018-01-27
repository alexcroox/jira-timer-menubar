import React from 'react'
import styled from 'styled-components'

const Loader = (props) => (
  <LoaderStyled {...props}>
    <svg width="20px"  height="20px"  xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid" class="lds-ellipsis">
      <circle cx="84" cy="50" r="0" fill="#c0f6d2">
        <animate attributeName="r" values="11;0;0;0;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
        <animate attributeName="cx" values="84;84;84;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
      </circle>
      <circle cx="40.0957" cy="50" r="11" fill="#ff7c81">
        <animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate>
        <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.5s"></animate>
      </circle>
      <circle cx="16" cy="50" r="7.79567" fill="#fac090">
        <animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate>
        <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="-0.25s"></animate>
      </circle>
      <circle cx="84" cy="50" r="3.20433" fill="#ffffcb">
        <animate attributeName="r" values="0;11;11;11;0" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
        <animate attributeName="cx" values="16;16;50;84;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
      </circle>
      <circle cx="74.0957" cy="50" r="11" fill="#c0f6d2">
        <animate attributeName="r" values="0;0;11;11;11" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
        <animate attributeName="cx" values="16;16;16;50;84" keyTimes="0;0.25;0.5;0.75;1" keySplines="0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1;0 0.5 0.5 1" calcMode="spline" dur="1s" repeatCount="indefinite" begin="0s"></animate>
      </circle>
    </svg>
  </LoaderStyled>
)

const LoaderStyled = styled.span`
  display: inline-block;
  vertical-align: middle;
`

export default Loader
