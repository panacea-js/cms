import glob from 'glob'
import fs from 'fs-extra'
import path from 'path'

/**
 * Clean up after running build process.
 */
export default function () {
  cleanUpOriginalNuxtAssets(path.resolve(__dirname, '..'))
}

const cleanUpOriginalNuxtAssets = function (rootDir) {
  const files = glob.sync(`${rootDir}/*.original`)
  // Remove compiled directory.
  files.map(file => fs.removeSync(file.replace('.original', '')))
  // Copy .original directory back to its original location (before building.)
  files.map(file => fs.copySync(file, file.replace('.original', '')))
  // Remove temporary .original directory.
  files.map(file => fs.removeSync(file))
}