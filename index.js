const panaceaCMSmiddleware = function(app, options) {

  const { fs, path, _ } = DI.container

  options = _.defaultsDeep(options, {
    basePath: '/cms'
  })

  const { basePath } = options

  app.use([basePath, basePath + '*', '/cms*'], function(req, res, next) {
    const mime = require('mime')

    const distDir = './dist/cms'

    let loadFile = ''

    if (/\/static\//.test(req.originalUrl)) {
      loadFile = path.resolve(
        __dirname,
        distDir,
        req.originalUrl
          .replace(basePath + '/', '')
          .replace('/cms/', ''))
    }
    else {
      loadFile = path.resolve(
        __dirname,
        distDir,
        'index.html'
      )
    }

    if (fs.pathExistsSync(loadFile)) {
      const fileContents = fs.readFileSync(loadFile, 'UTF-8')

      if (!res.getHeader('content-type')) {
        const fileType = mime.getType(loadFile)
        res.set('Content-Type', fileType + '; charset=utf-8')
      }

      res.send(fileContents)
    }
    else {
      res.status(404).send(`File not found: ${loadFile}`)
    }

    next()
  })

}

export { panaceaCMSmiddleware }