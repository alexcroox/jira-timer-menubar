import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import api from '../../lib/api'
import find from 'lodash.find'
import { addTimer } from '../../modules/timer'
import { isNotEmpty, isNotEmptyString } from '../../validation/helpers'
import FooterContainer from '../footer/footer-container'
import FormContainer from '../../components/form-container'
import TimerContainer from '../timer/timer-container'
import Header from '../../components/header'
import ErrorMessage from '../../components/error'
import NewTaskForm from './new-task-form'

const validationRules = {
  title: [
    [isNotEmpty, 'What is the summary for this task?']
  ],
  project: [
    [isNotEmptyString, 'What project does this task belong to?']
  ],
  taskType: [
    [isNotEmptyString, 'What type of task is this?']
  ],
}

class NewTaskContainer extends Component {
  constructor (props) {
    super(props)

    this.state = {
      creating: false,
      createError: false,
      fetchingProjects: true,
      projectOptions: [],
      projects: [],
      projectId: null,
      issueTypes: [],
      form: {
        title: '',
        project: '',
        taskType: ''
      }
    }

    this.onFormSubmit = this.onFormSubmit.bind(this)
    this.onGetProjects = this.onGetProjects.bind(this)
    this.onGetIssueTypes = this.onGetIssueTypes.bind(this)
    this.onProjectChange = this.onProjectChange.bind(this)
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

        this.setState({
          fetchingProjects: false,
          projects
        })

        let options = []
        projects.map(project => {
          options.push({
            value: project.id,
            label: project.name
          })
        })

        this.setState({ projectOptions: options })

        callback(null, {
          options,
          complete: true
        })
      })
      .catch(error => {
        console.log('Error fetching projects', error)

        this.setState({ fetchingProjects: false })

        callback(null, {
          options,
          complete: true
        })
      })
  }

  onGetIssueTypes (input, callback) {
    callback(null, {
      options: this.state.issueTypes
    })
  }

  onProjectChange (projectId) {

    this.setState({ projectId })

    let project = find(this.state.projects, ['id', projectId])

    if (project) {

      console.log('projectissuyetypes', project)

      let options = []
      project.issueTypes.map(issueType => {
        options.push({
          value: issueType.id,
          label: issueType.name
        })
      })

      this.setState({ issueTypes: options })
    }
  }

  onFormSubmit (formResponse) {
    if (this.state.creating)
      return false

    this.setState({ form: formResponse.form })

    if (formResponse.valid) {
      this.create(formResponse.form)
      this.setState({ creating: true })
    }
  }

  create (form) {
    console.log('Creating', form)

    api.post('/issue', {
      fields: {
        project: { id: form.project },
        summary: form.title,
        issuetype: { id: form.taskType }
      }
    })
      .then(newIssue => {

        console.log('Created new issue', newIssue)

        this.setState({
          creating: false
        })

        // Now create a new timer for convienience
        this.props.addTimer(newIssue.id, newIssue.key, form.title)

        this.props.history.push('/dashboard')
      })
      .catch(error => {
        console.log('Error creating task', error)

        this.setState({
          creating: false,
          createError: true
        })
      })
  }

  render () {
    return (
      <Fragment>
        <Header withBackButton titleText="Create New Task" />
        <TimerContainer />

        <FormContainer>
          {this.state.createError && (
            <ErrorMessage>Error creating task, try again</ErrorMessage>
          )}

          <NewTaskForm
            onSubmit={this.onFormSubmit}
            initialState={this.state.form}
            rules={validationRules}
            validateOnChange={true}
            validateSingle={true}
            submitting={this.state.creating}
            fetchingProjects={this.state.fetchingProjects}
            getProjects={this.onGetProjects}
            onProjectChange={this.onProjectChange}
            getIssueTypes={this.onGetIssueTypes}
            projectId={this.state.projectId}
          />
        </FormContainer>
      </Fragment>
    );
  }
}

const mapDispatchToProps = {
  addTimer
}

export default connect(null, mapDispatchToProps)(NewTaskContainer)

