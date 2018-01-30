import opn from 'opn'
import api from './api'

export const openInJira = taskKey => {

  let jiraDomain = api.jiraDomain
  opn(`https://${jiraDomain}/browse/${taskKey}`)
}
