//@ts-check

const errors = {
  'applications.gecko.id': 0,
  'theme_experiment.theme.required': 1,
  'manifest.parse': 2,
}

let errorCodes = {}

for (const key in errors) {
  errorCodes[errors[key]] = key
}

const errorMessage = {
  0: 'An applications.gecko.id is required',
  1: 'The theme key is required when the type is theme_experiment',
  2: 'The manifest file could not be parsed',
}

/**
 * Parses a manifest file and returns a list of errors.
 * @param {string} input An input manifest file
 * @returns {number[]} A list of errors
 */
function validate(input) {
  const errorTracker = []

  try {
    const manifest = JSON.parse(input)

    if (!manifest.applications?.gecko?.id) {
      errorTracker.push(errors['applications.gecko.id'])
    }

    if (manifest.theme_experiment && !manifest.theme) {
      errorTracker.push(errors['theme_experiment.theme.required'])
    }
  } catch (e) {
    errorTracker.push(errors['manifest.parse'])
  }

  return errorTracker
}

module.exports = { validate, errors, errorMessage, errorCodes }
