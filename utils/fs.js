//@ts-check

const { readdirSync, statSync } = require('fs')
const { isAbsolute, join } = require('path')

/**
 * Find all of the files in a directory recursively
 * @param {string} dirName The directory you want to walk. Must be absolute.
 * @returns {string[]} An array of all the files in the directory.
 */
function walkDirectory(dirName) {
  const output = []

  if (!isAbsolute(dirName)) {
    console.error('Please provide an absolute input to walkDirectory')
  }

  const directoryContents = readdirSync(dirName)

  for (const file of directoryContents) {
    const fullPath = join(dirName, file)
    const fStat = statSync(fullPath)

    if (fStat.isDirectory()) {
      for (const newFile of walkDirectory(fullPath)) {
        output.push(newFile)
      }
    } else {
      output.push(fullPath)
    }
  }

  return output
}

module.exports = {
  walkDirectory,
}
