import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import api from '../../lib/api'
import Input from '../../components/input'
import Task, { TaskContainer } from '../../components/task'

class SearchContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      searching: false,
      noResults: false,
      error: false,
      query: '',
      results: []
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.triggerChange = this.triggerChange.bind(this)
  }

  componentWillMount () {
    this.timer = null
  }

  handleChange (e) {
    clearTimeout(this.timer)

    let query = e.target.value

    this.setState({ query })

    if (query != "")
      this.setState({ searching: true })

    this.timer = setTimeout(this.triggerChange, 1000)
  }

  handleKeyDown (e) {
    if (e.keyCode === 13) {
      clearTimeout(this.timer)
      this.triggerChange()
    }
  }

  triggerChange () {
    this.search(this.state.query)
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

    api.post('/search', {
      jql: `text ~ "${query}" order by lastViewed DESC`,
      maxResults: 20,
      fields: ['key', 'summary', 'project']
    })
      .then(results => {
        console.log('Search results', results)

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
            onChange={this.handleChange}
            onKeyDown={this.handleKeyDown}
            value={this.state.query}
            autoFocus
          />
          {(this.state.searching && !this.state.noResults) && (
            <SearchLoading>Searching...</SearchLoading>
          )}

          {(this.state.error) ? (
            <SearchLoading>Error fetching results</SearchLoading>
          ) : (
            <Fragment>
              {(this.state.query && !this.state.searching && !this.state.results.length) && (
                <SearchLoading>No results</SearchLoading>
              )}
            </Fragment>
          )}
        </SearchWrapper>

        {this.state.results.length ? (
          <TaskContainer>
            {this.state.results.map(task => (
              <Task
                key={task.id}
                taskKey={task.key}
                title={task.fields.summary}
              />
            ))}
          </TaskContainer>
        ) : (null)
        }
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
`

export default SearchContainer
