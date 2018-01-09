import { Nuxt, Builder } from 'nuxt'
import bootstrap from '@panaceajs/core/src/utils/bootstrap'

/**
 * Prepares a nuxt build for build and live reload scripts.
 *
 * @param params
 *   Nuxt options (not Panacea's DI container options.)
 */
export default function (params = {}) {
  new bootstrap().all()

  const { _, path, options } = DI.container

  // Load defaults nuxt.config.js and override with options loaded in container.
  const nuxtConfigFile = require('../nuxt.config.js')
  const config = _.defaultsDeep(params, _.cloneDeep(options.cms), nuxtConfigFile)

  // Ensure root directory is considered the parent directory - the base of Panacea CMS.
  config.rootDir = path.resolve(__dirname, '..')

  // Hard code the srcDir option for safety as this directory is deleted when recompiled.
  config.srcDir = path.resolve(process.cwd(), '.compiled/cms')

  // Ensure the router knows about the set public path.
  config.router = config.router || {}
  config.router.base = config.build.publicPath

  // Append the compiled configuration from Panacea Core's is made
  // available to both client and server. Cloned to prevent circular referencing.
  const configExcludingEnv = _.cloneDeep(config)
  config.env = config.env || {}
  config.env.panacea = options
  config.env.cms = configExcludingEnv

  compileNuxtAssets(config)

  const nuxt = new Nuxt(config)
  const builder = new Builder(nuxt)

  return {
    nuxt,
    builder,
    config
  }

}

/**
 * Merge nuxt assets from:
 *   1. Panacea CMS
 *   2. Panacea plugins.
 *   3. Application
 *
 * @param {*} config
 *   Nuxt config options.
 */
const compileNuxtAssets = function (config) {
  const { _, path, fs, glob, rimraf, mkdirp, resolvePluginPath, registry } = DI.container

  // Remove and re-create compilation (srcDir) directory.
  rimraf.sync(config.srcDir)
  mkdirp.sync(config.srcDir)

  // Compile valid source paths of CMS assets.
  const cmsSourcePaths = [
    config.rootDir, // Panacea CMS assets.
    ...Object.keys(registry.plugins), // Panacea plugin assets.
    process.cwd() // Application assets.
  ]
  .map(dir => resolvePluginPath(dir))
  .map(dir => fs.pathExistsSync(path.join(dir, 'cms')) ? path.join(dir, 'cms') : dir)
  .flatMap(dir => glob.sync(dir + "/*/").filter(subDir => path.basename(subDir) !== 'node_modules'))
  .map(dir =>
    fs.copySync(
      dir,
      path.resolve(config.srcDir, path.basename(dir))
    )
  )
}
