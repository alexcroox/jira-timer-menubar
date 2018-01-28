import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
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
  fetchingProjects
}) => (
  <Fragment>
    <Fieldset>
      <Label>Project</Label>
      <Async
        name="project"
        value={form.project}
        onChange={compose(onChange('project'), getReactSelectValue)}
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
      <Label>Task Title</Label>
      <Input
        type="text"
        error={!isValid(errors.title)}
        onChange={compose(onChange('title'), getValue)}
        value={form.title}
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
