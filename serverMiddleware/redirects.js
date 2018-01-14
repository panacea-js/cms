const { options } = DI.container

const redirects = [
  {
    from: '/',
    to: `${options.cms.build.publicPath}dashboard`,
    status: 301,
  }
]

export default function (req, res, next) {
  const redirect = redirects.find(r => r.from === req.url)
  if (redirect) {
    console.log(`redirect: ${redirect.from} => ${redirect.to}`)
    res.writeHead(redirect.status, { Location: redirect.to })
    res.end()
  } else {
    next()
  }
}