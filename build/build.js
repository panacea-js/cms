import { Nuxt, Builder } from 'nuxt'
import bootstrap from '@panaceajs/core/src/utils/bootstrap'

/**
 * Prepares a nuxt build for build and live reload scripts.
 */
export default function (params = {}) {
  new bootstrap().all()

  const { options, path, fs, _ } = DI.container

  // Load defaults nuxt.config.js and override with options loaded in container.
  const nuxtConfigFile = require('../nuxt.config.js')
  const config = _.defaultsDeep(params, _.cloneDeep(options.cms), nuxtConfigFile)

  // Ensure root directory is considered the parent directory and not
  // the directory where this script is included from.
  config.rootDir = path.resolve(__dirname, '..')
  config.srcDir = path.resolve(__dirname, '..')

  // Ensure the router knows about the set public path.
  config.router = config.router || {}
  config.router.base = config.build.publicPath

  // Append the compiled configuration from Panacea Core's is made
  // available to both client and server. Cloned to prevent circular referencing.
  const configExcludingEnv = _.cloneDeep(config)
  config.env = config.env || {}
  config.env.panacea = options
  config.env.cms = configExcludingEnv

  // @todo Merging of assets should be resolved from registry to allow plugins to make cms additions
  const cmsCustomOverridesDir = path.resolve(process.cwd(), 'cms')
  mergeNuxtAssets(config.rootDir, cmsCustomOverridesDir)

  const nuxt = new Nuxt(config)
  const builder = new Builder(nuxt)

  return {
    nuxt,
    builder,
    config
  }

}

const mergeNuxtAssets = function (rootDir, cmsCustomOverridesDir) {

  const { path, fs } = DI.container

  const availableMergeDirectories = [
    'assets',
    'components',
    'layouts',
    'middleware',
    'pages',
    'plugins',
    'static',
    'store'
  ]

  const customOverrideDirExists = (dir) =>
    fs.pathExistsSync(
      path.resolve(cmsCustomOverridesDir, dir)
    )

  const originalDirDoesNotExist = (dir) =>
    !fs.pathExistsSync(
      path.resolve(rootDir, `${dir}.original`)
    )

  const createOriginalDir = dir => {
    fs.copySync(
      path.resolve(rootDir, dir),
      path.join(rootDir, `${dir}.original`)
    )
    return dir
  }

  const mergeCustomDirectoryToRoot = (dir) =>
    fs.copySync(
      path.resolve(cmsCustomOverridesDir, dir),
      path.join(rootDir, dir)
    )

  // Create .original directories for each of the nuxt custom
  // override directories if they don't exist.
  availableMergeDirectories
    .filter(customOverrideDirExists)
    .filter(originalDirDoesNotExist)
    .map(createOriginalDir)

  // Merge nuxt custom overrides to compilation root.
  availableMergeDirectories
    .filter(customOverrideDirExists)
    .map(mergeCustomDirectoryToRoot)
}
