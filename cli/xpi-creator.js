#!/usr/bin/env node
// @ts-check
const { execSync } = require('child_process')
const {
  existsSync,
  mkdirSync,
  copyFileSync,
  writeFileSync,
  rmSync,
  readFileSync,
} = require('fs')
const { join, dirname } = require('path')

const { walkDirectory } = require('./fs')
const { getIgnoredFiles, isIgnored } = require('./ignore')
const { generateManifest } = require('./manifest')

// Handle argument parsing
const argv = require('minimist')(process.argv.slice(2))

const folders = argv._

if (folders.length !== 2) {
  console.log('Usage: xpi-creator <src> <out>')
  process.exit(1)
}

// Grab the first folder, this is where the source is
const [input, output] = [
  join(process.cwd(), folders[0]),
  join(process.cwd(), folders[1]),
]

console.log(`${input} -> ${output}`)
console.log()
console.log('Validating')
console.log('==========')
console.log()

const manifestPath = join(input, 'manifest.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))

// Manifest files must include applications.gecko.id
if (!manifest.applications?.gecko?.id) {
  console.log(
    'applications.gecko.id... NOT INCLUDED: will cause .xpi corruption'
  )
  process.exit(1)
} else {
  console.log('applications.gecko.id... OK')
}

console.log()
console.log('Preparing to convert')
console.log('====================')
console.log()

console.log('Generating ignored files...')
const toIgnore = getIgnoredFiles(input)

const tempDir = join(input, 'tmp')

console.log(`Creating ${tempDir}...`)

// Delete the directory if it exists
if (existsSync(tempDir)) {
  console.log(`Deleting ${tempDir}...`)
  rmSync(tempDir, { recursive: true })
}

// Create the directory recursively
mkdirSync(tempDir, { recursive: true })

console.log(`Copying ${input}...`)
const directoryContents = walkDirectory(input)

directoryContents
  .map((file) => ({
    in: file,
    out: file.replace(input, tempDir),
    rel: file.replace(input, '').replace('/', ''),
  }))
  .filter((file) => !isIgnored(file.rel, toIgnore))
  .forEach((file) => {
    const { in: inFile, out: outFile } = file
    mkdirSync(dirname(outFile), { recursive: true })
    copyFileSync(inFile, outFile)
  })

console.log()
console.log('Building XPI META-INF')
console.log('=====================')
console.log()

mkdirSync(join(tempDir, 'META-INF'), { recursive: true })

console.log('cose.manifest...')
const files = generateManifest(tempDir, toIgnore)

writeFileSync(
  join(tempDir, 'META-INF', 'cose.manifest'),
  `Manifest-Version: 1.0\n\n${files}`
)

console.log('manifest.mf...')
const mfManifest = generateManifest(tempDir, toIgnore)

writeFileSync(
  join(tempDir, 'META-INF', 'manifest.mf'),
  `Manifest-Version: 1.0\n\n${mfManifest}`
)

console.log('manifest.sf...')
const sig = [
  {
    sha1Digest: execSync(
      `openssl dgst -sha1 -binary ${join(
        tempDir,
        'META-INF',
        'manifest.mf'
      )} | openssl enc -base64`
    )
      .toString()
      .trim(),
    sha256Digest: execSync(
      `openssl dgst -sha256 -binary ${join(
        tempDir,
        'META-INF',
        'manifest.mf'
      )} | openssl enc -base64`
    )
      .toString()
      .trim(),
  },
]
  .map(
    (file) =>
      `SHA1-Digest: ${file.sha1Digest}\nSHA256-Digest: ${file.sha256Digest}`
  )
  .join('\n\n')

writeFileSync(
  join(tempDir, 'META-INF', 'manifest.sf'),
  `Signature-Version: 1.0\n${sig}`
)

console.log('Compressing...')
execSync(`cd ${tempDir} && zip -9 -r -q ${output} ./*`)
console.log('Cleaning up...')
rmSync(tempDir, { recursive: true })

console.log('Done!')
