import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faHistory from '@fortawesome/fontawesome-free-solid/faHistory'
import IconLink from '../../components/icon-link'
import ExternalLink from '../../components/external-link'

class FooterContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      totalToday: 'test',
      totalWeek: 'test',
    }
  }

  render() {
    return (
      <FooterStyled>
        {this.props.authToken ? (
          <Fragment>
            <div>
              <TimeSummaryContainer>
                Today <TimeSummary>4h 15m</TimeSummary>
              </TimeSummaryContainer>

              {this.props.showAllSummaries && (
                <Fragment>
                  <TimeSummaryContainer>
                    Yesterday <TimeSummary>7h 30m</TimeSummary>
                  </TimeSummaryContainer>
                  <TimeSummaryContainer>
                    Week <TimeSummary>32h 45m</TimeSummary>
                  </TimeSummaryContainer>
                </Fragment>
              )}
            </div>

            <IconLink to="/history">
              {this.props.fetchingHistory ? (
                <FontAwesomeIcon spin icon={faHistory} />
              ) : (
                <FontAwesomeIcon icon={faHistory} />
              )}
            </IconLink>
          </Fragment>
        ) : (
          <Credits>created by <ExternalLink>Si digital</ExternalLink></Credits>
        )}
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

const TimeSummaryContainer = styled.span`
  margin-right: 20px;
  color: #666;
  font-size: 12px;
`
const TimeSummary = styled.span`
  font-weight: 500;
  margin-left: 2px;
`

const Credits = styled.div`
  text-align: right;
  width: 100%;
`

const mapStateToProps = state => ({
  authToken: state.user.authToken,
})

export default connect(mapStateToProps)(FooterContainer)
