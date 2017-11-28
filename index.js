const panaceaCMSmiddleware = function(app) {

  const { fs, path } = DI.container
  const basePath = '/cms'
  const distDir = './dist/cms'

  const indexFile = path.resolve(
    __dirname,
    distDir,
    'index.html'
  )

  app.use([basePath, basePath + '*'], function(req, res, next) {

    const mime = require('mime')

    const requestedFile = req.originalUrl
      .replace(basePath + '/', '')
      .replace('/cms/', '')

    let loadFile = path.resolve(
      __dirname,
      distDir,
      requestedFile
    )

    // If loadFile path isn't available the re-route to index file.
    if (!fs.pathExistsSync(loadFile) || !fs.lstatSync(loadFile).isFile()) {
      loadFile = indexFile
    }

    const fileContents = fs.readFileSync(loadFile, 'UTF-8')

    if (!res.getHeader('content-type')) {
      const fileType = mime.getType(loadFile)
      res.set('Content-Type', fileType + '; charset=utf-8')
    }

    res.send(fileContents)
    next()

  })

}

export { panaceaCMSmiddleware }