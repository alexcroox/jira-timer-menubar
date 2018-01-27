import compose from 'ramda/src/compose'
import curry from 'ramda/src/curry'
import path from 'ramda/src/path'
import prop from 'ramda/src/prop'

export const getValue = path(['target', 'value'])
export const getCheckedValue = path(['target', 'checked'])
export const getAutoCompleteValue = (a) => {
  if (typeof a === "object")
    return path(['target', 'checked'], a)
  else
    return a
}

export const isEmpty = a => a == '' || a === null
export const isNotEmpty = a => a !== null && a.trim().length > 0
export const isNotEmptyString = a => a !== null && a != ''
export const isNotNullOrEmpty = a => {

  if (typeof a === 'string' && a.trim().length === 0)
    return false

  return a !== null && a !== ''
}
export const hasCapitalLetter = a => /[A-Z]/.test(a)
export const isGreaterThan = curry((len, a) => (a > len))
export const isLengthGreaterThan = len => compose(isGreaterThan(len), prop('length'))
export const isEqual = compareKey => (a, all) => a === all[compareKey]
export const isTrue = a => a === true

// Messages
export const minimumMsg = (field, len) => `Minimum ${field} length of ${len} is required.`
export const capitalLetterMag = field => `${field} should contain at least one uppercase letter.`
export const equalMsg = (field1, field2) => `${field2} should be equal to ${field1}`
