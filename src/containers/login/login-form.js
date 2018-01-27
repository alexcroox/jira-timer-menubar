import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import compose from 'ramda/src/compose'
import head from 'ramda/src/head'
import revalidation, { isValid } from 'revalidation'
import { getValue } from '../../validation/helpers'
import Label from '../../components/label'
import Input from '../../components/input'
import Fieldset from '../../components/fieldset'
import Button from '../../components/button'
import FormHelperText from '../../components/form-helper-text'

const Form = ({
  revalidation : { form, onChange, updateState, valid, errors = {}, onSubmit },
  onSubmit: onSubmitCb,
  submitting = false
}) => (
  <Fragment>
    <Fieldset>
      <Label>JIRA URL</Label>
      <Input
        type="text"
        error={!isValid(errors.authUrl)}
        onChange={compose(onChange('authUrl'), getValue)}
        value={form.authUrl}
        name="authUrl"
        id="authUrl"
      />
      {!isValid(errors.authUrl) && (
        <FormHelperText error>{head(errors.authUrl)}</FormHelperText>
      )}
    </Fieldset>

    <Fieldset>
      <Label>JIRA Username</Label>
      <Input
        type="text"
        error={!isValid(errors.username)}
        onChange={compose(onChange('username'), getValue)}
        value={form.username}
        name="username"
        id="username"
        placeholder="bob@example.com"
        autoFocus
      />
      {!isValid(errors.username) && (
        <FormHelperText error>{head(errors.username)}</FormHelperText>
      )}
    </Fieldset>

    <Fieldset>
      <Label>JIRA Password</Label>
      <Input
        type="password"
        error={!isValid(errors.password)}
        onChange={compose(onChange('password'), getValue)}
        onKeyPress={(e) => { if (e.key === 'Enter') onSubmit(onSubmitCb) }}
        value={form.password}
        name="password"
        id="password"
      />
      {!isValid(errors.password) && (
        <FormHelperText error>{head(errors.password)}</FormHelperText>
      )}
      <FormHelperText>Your password will be stored in the keychain</FormHelperText>
    </Fieldset>

    <Fieldset>
      <Button
        primary
        large
        loading={submitting}
        onClick={() => onSubmit(onSubmitCb)}
      >
        {submitting ? 'Logging in...' : 'Login'}
      </Button>
    </Fieldset>
  </Fragment>
)

export default revalidation(Form)
