import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom'
import { connect } from 'react-redux'
import { addTimer } from '../../modules/timer'
import styled from 'styled-components'
import api from '../../lib/api'
import Input from '../../components/input'
import Task, { TaskContainer } from '../../components/task'
import FontAwesomeIcon from '@fortawesome/react-fontawesome'
import faTimes from '@fortawesome/fontawesome-free-solid/faTimes'

class SearchContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searching: false,
      noResults: false,
      error: false,
      query: '',
      results: [],
      cursor: -1
    }

    this.listRefs = {}

    this.onChange = this.onChange.bind(this)
    this.onKeyDown = this.onKeyDown.bind(this)
    this.triggerChange = this.triggerChange.bind(this)
    this.onAddTimer = this.onAddTimer.bind(this)
    this.onClearSearch = this.onClearSearch.bind(this)
  }

  componentWillMount () {
    this.searchTimer = null
  }

  onAddTimer (id, key, summary) {
    this.props.addTimer(id, key, summary)
    this.onClearSearch()
  }

  onClearSearch () {
    this.setState({
      query: '',
      results: []
    })
  }

  onChange (e) {
    clearTimeout(this.searchTimer)

    let query = e.target.value
    this.setState({ query })

    if (query != "")
      this.setState({ searching: true })

    this.searchTimer = setTimeout(this.triggerChange, 600)
  }

  onKeyDown (e) {
    switch (e.keyCode) {
      // Enter
      case 13:
        if (this.state.cursor === -1) {
          clearTimeout(this.searchTimer)
          this.triggerChange()
        } else {
          // Pressing enter while navigating tasks with keyboard
          let chosenTask = this.state.results[this.state.cursor]
          this.onAddTimer(chosenTask.id, chosenTask.key, chosenTask.fields.summary)
        }
        break

      // Up arrow
      case 38:
        e.preventDefault()

        console.log(this.state.cursor)

        if (this.state.cursor > -1)
          this.setState(prevState => ({
            cursor: prevState.cursor - 1
          }))

          this.scrollActiveTaskIntoView()
        break

      // Down arrow
      case 40:
        e.preventDefault()

        if (this.state.cursor < this.state.results.length - 1)
          this.setState(prevState => ({
            cursor: prevState.cursor + 1
          }))

          this.scrollActiveTaskIntoView()
        break
    }
  }

  scrollActiveTaskIntoView () {
    let itemComponent = this.refs.activeItem
    if (itemComponent) {
      let domNode = ReactDOM.findDOMNode(itemComponent)
      domNode.scrollIntoView(true)
    }
  }

  triggerChange () {
    this.search(this.state.query)
    this.setState({ cursor: -1 })
  }

  search (query) {
    console.log('Searching', query)

    if (query == "") {
      return this.setState({
        searching: false,
        error: false,
        results: []
      })
    }

    this.setState({
      searching: true,
      error: false
    })

    // JIRA api throws an error if you attempt a key search with a string
    // that doesn't have a dash in it
    let keySearch = query.indexOf("-") > -1
    let jql = `summary ~ "${query}"`
    if (keySearch) jql += `OR key = "${query}"`
    jql += 'order by lastViewed DESC'

    api.post('/search', {
      jql,
      maxResults: 20,
      fields: ['key', 'summary', 'project']
    })
      .then(results => {
        console.log('Search results', results.total)

        this.setState({
          searching: false,
          results: results.issues
        })
      })
      .catch(error => {
        console.log('Error fetching search results', error)

        this.setState({
          searching: false,
          error: true
        })
      })
  }

  render () {
    return (
      <Fragment>
        <SearchWrapper>
          <Input
            type="text"
            placeholder="Search for tasks"
            onChange={this.onChange}
            onKeyDown={this.onKeyDown}
            value={this.state.query}
            autoFocus
          />
          {(this.state.searching && !this.state.noResults) && (
            <SearchLoading>Searching...</SearchLoading>
          )}

          {this.state.error ? (
            <SearchLoading>Error fetching results</SearchLoading>
          ) : (
            <Fragment>
              {(this.state.query && !this.state.searching && !this.state.results.length) && (
                <SearchLoading>No results</SearchLoading>
              )}

              {(this.state.query && !this.state.searching && this.state.results.length !== 0) && (
                <SearchLoading onClick={this.onClearSearch}>
                  <FontAwesomeIcon icon={faTimes} />
                </SearchLoading>
              )}
            </Fragment>
          )}
        </SearchWrapper>

        {this.state.results.length ? (
          <TaskContainer maxHeight>
            {this.state.results.map((task, i) => (
              <Task
                key={task.id}
                ref={i === this.state.cursor ? 'activeItem' : null}
                taskKey={task.key}
                highlighted={i === this.state.cursor}
                title={task.fields.summary}
                onAddTimer={() => this.onAddTimer(task.id, task.key, task.fields.summary)}
              />
            ))}
          </TaskContainer>
        ) : (null)}
      </Fragment>
    );
  }
}

const SearchWrapper = styled.div`
  padding: 10px;
  background: #f5f5f4;
  position: relative;
`

const SearchLoading = styled.div`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: #AAA;

  &:hover {
    cursor: pointer;
  }
`

const mapDispatchToProps = {
  addTimer
}

const mapStateToProps = state => ({
  timers: state.timer.list
})

export default connect(mapStateToProps, mapDispatchToProps)(SearchContainer)
