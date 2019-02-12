import React, { Component, Fragment } from 'react'
import compose from 'ramda/src/compose'
import head from 'ramda/src/head'
import revalidation, { isValid } from 'revalidation'
import { getValue, getReactSelectValue } from '../../validation/helpers'
import Label from '../../components/label'
import Input from '../../components/input'
import Fieldset from '../../components/fieldset'
import Button from '../../components/button'
import FormHelperText from '../../components/form-helper-text'
import { Async } from 'react-select'

const Form = ({
  revalidation : { form, onChange, updateState, valid, errors = {}, onSubmit },
  onSubmit: onSubmitCb,
  submitting = false,
  getProjects,
  fetchingProjects,
  onProjectChange,
  getIssueTypes,
  projectId,
  issueTypes
}) => (
  <Fragment>
    <Fieldset>
      <Label>Project</Label>
      <Async
        name="project"
        value={form.project}
        onChange={selectedOption => {
          onChange('project', getReactSelectValue(selectedOption))
          onProjectChange(getReactSelectValue(selectedOption))
        }}
        loadOptions={getProjects}
        isLoading={fetchingProjects}
        loadingPlaceholder="Loading projects..."
        autoFocus
      />
      {!isValid(errors.project) && (
        <FormHelperText error>{head(errors.project)}</FormHelperText>
      )}
    </Fieldset>

    <Fieldset>
      <Label>Task Type</Label>
      <Async
        key={projectId}
        name="taskType"
        value={form.taskType}
        onChange={selectedOption => {
          console.log('tt change')
          onChange('taskType', getReactSelectValue(selectedOption))
        }}
        loadOptions={getIssueTypes}
        searchable={false}
        cache={false}
        disabled={!projectId}
        placeholder="Select the task type"
        searchPromptText="No available task types"
      />
      {!isValid(errors.taskType) && (
        <FormHelperText error>{head(errors.taskType)}</FormHelperText>
      )}
    </Fieldset>

    <Fieldset>
      <Label>Task Title</Label>
      <Input
        type="text"
        error={!isValid(errors.title)}
        onChange={compose(onChange('title'), getValue)}
        value={form.title}
        onKeyPress={(e) => { if (e.key === 'Enter') onSubmit(onSubmitCb) }}
        name="title"
        id="title"
      />
      {!isValid(errors.title) && (
        <FormHelperText error>{head(errors.title)}</FormHelperText>
      )}
    </Fieldset>

    <Fieldset>
      <Button
        primary
        large
        loading={submitting || fetchingProjects}
        onClick={() => onSubmit(onSubmitCb)}
      >
        {submitting ? 'Creating...' : 'Create task'}
      </Button>
    </Fieldset>
  </Fragment>
)

export default revalidation(Form)
