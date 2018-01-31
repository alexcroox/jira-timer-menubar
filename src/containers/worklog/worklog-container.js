import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { fetchWorklogs } from '../../modules/worklog'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faSyncAlt from '@fortawesome/fontawesome-free-solid/faSyncAlt'
import FooterContainer from '../footer/footer-container'
import TimerContainer from '../timer/timer-container'
import Header from '../../components/header'
import Worklog from '../../components/worklog'
import LargeIcon from '../../components/large-icon'
import WorklogTotals from './worklog-totals'

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
          <WorklogTotals showAll />

          <WorklogsUpdating>
            {this.props.updating ? (
              `Fetching worklogs...`
            ) : (
              <LargeIcon clickable onClick={this.props.fetchWorklogs}>
                <FontAwesomeIcon icon={faSyncAlt} />
              </LargeIcon>
            )}
          </WorklogsUpdating>
        </FooterContainer>
      </Fragment>
    );
  }
}

const Worklogs = styled.div`
  overflow: auto;
  height: 331px;
`

const WorklogsUpdating = styled.span`
  opacity: 0.5
`

const mapDispatchToProps = {
  fetchWorklogs
}

const mapStateToProps = state => ({
  worklogs: state.worklog.list,
  updating: state.worklog.updating
})

export default connect(mapStateToProps, mapDispatchToProps)(WorklogContainer)
