//@ts-check

const { readFileSync } = require('fs')
const { join } = require('path')

const fg = require('fast-glob')
const { isMatch } = require('micromatch')

/**
 * Gets a list of globs to ignore
 * @param {string} inputFolder The folder that contains the files to be converted
 * @returns {string[]} The list of globs to ignore
 */
function getIgnoredFiles(inputFolder) {
  const ignores = [
    '**/node_modules/**',
    '**/.git/**',
    '**/.DS_Store',
    '**/.xpiignore',
    '**/.gitignore',
  ]

  const ignoreFiles = fg.sync('**/.xpiignore', { dot: true, cwd: inputFolder })

  for (const ignoreFile of ignoreFiles) {
    const fileContent = readFileSync(join(inputFolder, ignoreFile), 'utf8')

    const lines = fileContent.split('\n')
    for (const line of lines) {
      if (line.trim().length > 0) {
        if (line.includes('\\')) {
          console.log(
            `WARNING: ${line} contains a backslash. Even on windows, you should use / to delimitate paths`
          )
        }

        ignores.push(line.trim())
      }
    }
  }

  return ignores
}

/**
 * Checks against a list of ignored files to see if they should be discarded or
 * not
 *
 * @param {string} filePath The path that we need to check
 * @param {string[]} ignoredFiles The list of globs to ignore
 * @returns {boolean} Whether the file should be ignored
 */
function isIgnored(filePath, ignoredFiles) {
  // If the file path matches any of the globs in ignoredFiles, return true
  return isMatch(filePath, ignoredFiles)
}

module.exports = {
  getIgnoredFiles,
  isIgnored,
}
