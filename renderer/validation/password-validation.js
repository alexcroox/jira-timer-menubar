import {
  isLengthGreaterThan,
  minimumMsg,
  equalMsg,
  isEqual,
  isEmpty
} from './helpers'

export const repeatPasswordValidationRule = [
  [
    isEqual('password'),
    equalMsg('password', 'Confirm password')
  ]
]

export const newPasswordValidationRule = [
  [
    v => isEmpty(v) || isLengthGreaterThan(5)(v),
    minimumMsg('Password', 6)
  ]
]

const passwordValidationRule = [
  [
    isLengthGreaterThan(5),
    minimumMsg('Password', 6)
  ]
]

export default passwordValidationRule
