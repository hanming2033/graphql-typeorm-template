import { ValidationError } from 'yup'

// *ValidationError simplify
// ValidationError returns a lot of info
// this method only keeps path and message
export const formatYupError = (err: ValidationError) => {
  const errors: Array<{ path: string; message: string }> = []
  err.inner.forEach(e => {
    errors.push({
      path: e.path,
      message: e.message
    })
  })

  return errors
}
