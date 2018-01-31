import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { fetchWorklogs } from '../../modules/worklog'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import Header from '../../components/header'
import Worklog from '../../components/worklog'

class WorklogContainer extends Component {
  constructor (props) {
    super(props)
  }

  componentWillMount () {
    this.props.fetchWorklogs()
  }

  render () {
    return (
      <Fragment>
        <Header
          titleText="Posted Times"
          withBackButton
        />

        <TimerContainer />

        <Worklogs>
          {this.props.worklogs.map(worklog => (
            <Worklog key={worklog.id} {...worklog} />
          ))}
        </Worklogs>

        <FooterContainer>
          Lots of totals here
        </FooterContainer>
      </Fragment>
    );
  }
}

const Worklogs = styled.div`
  overflow: auto;
  height: 331px;
`

const mapDispatchToProps = {
  fetchWorklogs
}

const mapStateToProps = state => ({
  worklogs: state.worklog.list
})

export default connect(mapStateToProps, mapDispatchToProps)(WorklogContainer)
