import React, { Component, Fragment } from 'react'
import api from '../../lib/api'
import FooterContainer from '../footer/footer-container'
import FormContainer from '../../components/form-container'
import Header from '../../components/header'
import ErrorMessage from '../../components/error'
import NewTaskForm from './new-task-form'
import { isNotEmpty, isNotEmptyString } from '../../validation/helpers'

const validationRules = {
  title: [
    [isNotEmpty, 'What is the summary for this task?']
  ],
  project: [
    [isNotEmptyString, 'What project does this task belong to?']
  ],
}

class NewTaskContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      creating: false,
      createError: false,
      fetchingProjects: true,
      projects: [],
      form: {
        title: '',
        project: ''
      }
    }

    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onGetProjects = this.onGetProjects.bind(this)
  }

  onGetProjects (input, callback) {

    // React select wants to call this function every time the user
    // types. We don't need to re-fetch the projects so lets send
    // back the cached list
    if (this.state.projects.length)
      return callback(null, {
        options: this.state.projects,
        complete: true
      })

    this.setState({ fetchingProjects: true })

    api.get('/project?expand=issueTypes')
      .then(projects => {
        console.log('Projects', projects)

        this.setState({ fetchingProjects: false })

        let options = []
        projects.map(project => {
          options.push({
            value: project.id,
            label: project.name
          })
        })

        this.setState({ projects: options })

        callback(null, {
          options,
          complete: true
        })
      })
      .catch(error => {
        console.log('Error fetching projects', error)
        this.setState({ fetchingProjects: true })
        callback(null, {
          options,
          complete: true
        })
      })
  }

  onFormSubmit (formResponse) {
    if (this.state.creating)
      return false

    this.setState(() => ({
      creating: true,
      form: formResponse.form
    }))

    if (formResponse.valid)
      this.create(formResponse.form)
  }

  create (form) {

  }

  render () {
    return (
      <Fragment>
        <Header withBackButton titleText="Create New Task" />

        <FormContainer>
          {this.state.createError && (
            <ErrorMessage>Error creating task, try again</ErrorMessage>
          )}

          <NewTaskForm
            onSubmit={this.onFormSubmit}
            initialState={this.state.form}
            rules={validationRules}
            validateOnChange={false}
            submitting={this.state.creating}
            fetchingProjects={this.state.fetchingProjects}
            getProjects={this.onGetProjects}
          />
        </FormContainer>

        <FooterContainer />
      </Fragment>
    );
  }
}

export default NewTaskContainer
