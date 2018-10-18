import { Nuxt, Builder } from 'nuxt'
import Bootstrap from '@panaceajs/core/dist/utils/bootstrap'

/**
 * Prepares a nuxt build for build and live reload scripts.
 *
 * @param params
 *   Nuxt options (not Panacea's container options.)
 */
export default async function (params = {}) {
  await new Bootstrap().runStages([
    '10-add-plugins-registry',
    '20-register-hooks',
    '30-register-entity-types'
  ])
  const { _, path, options } = Panacea.container

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

  if (params.compileOnly) {
    return compileFiles(config)
  } else {
    return fullBuild(config)
  }
}

const compileFiles = (config) => {
  compileNuxtAssets(config)
  compileVarsAssets(config)
  compileLocales(config)
  return {}
}

const fullBuild = (config) => {
  const { rimraf, mkdirp } = Panacea.container

  // Remove and re-create compilation (srcDir) directory.
  rimraf.sync(config.srcDir)
  mkdirp.sync(config.srcDir)

  compileNuxtAssets(config)
  compileVarsAssets(config)
  compileLocales(config)

  const nuxt = new Nuxt(config)
  const builder = new Builder(nuxt)

  return {
    nuxt,
    builder,
    config
  }
}

/**
 * Get a list of sources base paths from core, plugins and application.
 *
 * @param {*} config
 */
const sourcePaths = (config, options = {}) => {
  const { path, fs, resolvePluginPath, registry } = Panacea.container

  return [
    options.includeCore ? path.dirname(require.resolve('@panaceajs/core')) : null, // Panacea core.
    config.rootDir, // Panacea CMS.
    ...Object.keys(registry.plugins), // All Panacea plugins.
    process.cwd() // Application.
  ]
    .filter(x => !!x)
    .map(dir => resolvePluginPath(dir))
    .map(dir => fs.pathExistsSync(path.join(dir, 'cms')) ? path.join(dir, 'cms') : dir)
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
  const { path, glob, rsync: Rsync } = Panacea.container

  const excludeDirectories = (dirs, subDir) => !dirs.find(exclude => exclude === path.basename(subDir))

  // Compile valid source paths of CMS assets.
  sourcePaths(config)
    .flatMap(dir => glob.sync(dir + '/*/').filter(subDir => excludeDirectories(['node_modules', 'locales', 'build'], subDir)))
    .map(dir => {
      const rsync = new Rsync()
        .progress()
        .recursive()
        .update()
        .source(dir)
        .destination(path.resolve(config.srcDir, path.basename(dir)))

      rsync.execute((error, code, cmd) => {
        if (error) {
          console.error(error)
        }
      })
    })
}

/**
 * Create static files from configuration which can be referenced by
 * nuxt plugins and nuxt-sass-resources-loader
 *
 * @param {*} config
 *   Nuxt config options.
 */
const compileVarsAssets = function (config) {
  const { _, path, fs } = Panacea.container

  // Export the vars to json file so they can be referenced publicly and by plugins.
  fs.writeJsonSync(path.resolve(config.srcDir, 'assets/vars.json'), config.vars)

  // Export the color vars to scss file so they can be included with nuxt-sass-resources-loader
  // and be used in any Vue component style tag.
  // See nuxt.config.js for nuxt-sass-resources-loader configuration.
  const colorsScss = _(config.vars.colors).map((color, name) => `$color-${name}: ${color};`).join('\n')
  fs.writeFileSync(path.resolve(config.srcDir, 'assets/colors.scss'), colorsScss)

  // Export the color vars to styl file so they can be imported in stylus files and components with:
  // @require '~assets/colors.styl'
  const colorsStylus = _(config.vars.colors).map((color, name) => `$color-${name} = ${color}`).join('\n')
  fs.writeFileSync(path.resolve(config.srcDir, 'assets/colors.styl'), colorsStylus)
}

/**
 * Compile all locale files into a single file.
 *
 * @param {*} config
 *   Nuxt config options.
 */
const compileLocales = function (config) {
  const { _, path, fs, glob, mkdirp } = Panacea.container

  mkdirp.sync(path.join(config.srcDir, 'locales'))

  const allLocaleMessages = sourcePaths(config, { includeCore: true })
    .flatMap(dir => glob.sync(path.resolve(dir, 'locales/*.json')))
    .reduce((acc, file) => {
      const locale = path.basename(file).replace('.json', '')
      acc[locale] = _.merge(acc[locale] || {}, fs.readJsonSync(file))
      return acc
    }, {})

  _(allLocaleMessages).forEach((messages, locale) => {
    const keyedMessages = {}
    keyedMessages[locale] = messages
    fs.writeJsonSync(path.join(config.srcDir, `locales/${locale}.json`), keyedMessages)
  })
}
