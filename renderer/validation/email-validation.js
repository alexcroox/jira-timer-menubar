import { isLengthGreaterThan } from './helpers'

const invalidMessage = 'That email looks invalid'
export const hasAmpersat = a => /\S+@\S+\.\S+/.test(a)

const emailValidationRule = [
  [isLengthGreaterThan(3), invalidMessage],
  [hasAmpersat, invalidMessage]
]

export default emailValidationRule
