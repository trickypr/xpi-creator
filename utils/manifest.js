//@ts-check

const { execSync } = require('child_process')
const { walkDirectory } = require('./fs')

/**
 * Generates a manifest file for a directory
 * @param {string} tempDir The directory to generate a manifest for
 * @returns {string} The generated manifest
 */
function generateManifest(tempDir) {
  return walkDirectory(tempDir)
    .map((file) => ({
      real: file,
      // Remove tmp directory and the first slash
      fake: file.replace(tempDir, '').replace('/', ''),
    }))
    .filter((file) => !file.fake.startsWith('.git'))
    .map((file) => ({
      name: file.fake,
      digestAlgorithm: 'SHA1 SHA256',
      sha1Digest: execSync(
        `openssl dgst -sha1 -binary ${file.real} | openssl enc -base64`
      )
        .toString()
        .trim(),
      sha256Digest: execSync(
        `openssl dgst -sha256 -binary ${file.real} | openssl enc -base64`
      )
        .toString()
        .trim(),
    }))
    .map(
      (file) =>
        `Name: ${file.name}\nDigest-Algorithms: ${file.digestAlgorithm}\nSHA1-Digest: ${file.sha1Digest}\nSHA256-Digest: ${file.sha256Digest}`
    )
    .join('\n\n')
}

module.exports = {
  generateManifest,
}
