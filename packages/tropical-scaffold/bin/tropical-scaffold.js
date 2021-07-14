#!/usr/bin/env node

import {extname, basename, resolve} from 'path'
import pkgDir from 'pkg-dir'
import fse from 'fs-extra'
import {pascalCase, sentenceCase} from 'change-case'
import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

;(async () => {
  const projectRoot = await pkgDir()
  const name = argv._[0]

  switch (argv.type) {
    case 'page':
      scaffoldPage(projectRoot, name)
      break
    case 'component':
      scaffoldComponent(projectRoot, name)
      break
    default:
      throw new Error(`Unsupported --type: ${type}`)
  }
})()

async function write (outFile, contents) {
  try {
    const exists = await fse.pathExists(outFile)
    if (exists) {
      console.warn(`⚠️   File already exists, skipping: ${outFile}`)
    } else {
      await fse.outputFile(outFile, contents)
      console.log('🖨   Created:', outFile)
    }
  } catch (e) {
    console.error(e)
  }
}

async function scaffoldPage(projectRoot, path) {
  const ext = extname(path).toLowerCase() || '.mdx'
  const filename = basename(path, ext)
  
  let contents
  switch (ext) {
    case '.mdx':
      contents = mdxPage(sentenceCase(filename))
      break
    case '.jsx':
      contents = jsxPage(pascalCase(filename), sentenceCase(filename))
      break
    default:
      throw new Error(`Unsupported file extension: ${ext}`)
  }

  const outFile = resolve(projectRoot, 'src/pages', `${filename}${ext}`)
  write(outFile, contents)
}

function mdxPage(title) {
  return `export const meta = {
  title: \`${title}\`
}

# ${title}
`
}

function jsxPage(componentName, title) {
  return `import React from 'react'
import { useFela } from 'react-fela'

export const meta = {
  title: \`${title}\`
}

export default function ${componentName}Page ({ meta, pages }) {
  const { css } = useFela()

  return (
    <>
      <h1 className={css({ color: hotpink })}>{meta.title}</h1>
    </>
  )
}
`
}

async function scaffoldComponent(projectRoot, name) {
  const componentsDir = resolve(projectRoot, 'src/components')
  write(resolve(projectRoot, 'src/components', name, 'index.js'), componentIndex(name))
  write(resolve(projectRoot, 'src/components', name, `${name}.jsx`), componentMain(name))
  write(resolve(projectRoot, 'src/components', name, `${name}.stories.jsx`), componentStories(name))
}

function componentIndex (componentName) {
  return `export * from './${componentName}'`
}

function componentMain (componentName) {
  return `import React from 'react'
import { useFela } from 'react-fela'

export function ${componentName}() {
  const { css } = useFela()

  return (
    <div></div>
  )
}
`
}

function componentStories (componentName) {
  return `import React from 'react'
import { ${componentName} } from './${componentName}'

export default {
  title: '${componentName}',
  component: ${componentName}
}

const Template = (args) => <${componentName} {...args} />

export const Standard = Template.bind({})
Standard.args = {
  // props here
}
`
}
