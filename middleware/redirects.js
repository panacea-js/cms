export default function ({ route, redirect, app }) {

  route.path.slice(-1) === '/' && redirect(route.path.slice(0, -1))

  const locale = app.i18n.locale

  const redirects = [
    { from: `/`, to: `/dashboard` },
  ]

  const allLocales = Object.keys(app.i18n.messages)
  allLocales.map(l => redirects.push({ from: `/${l}`, to: `/dashboard` }))

  redirects.map(r => r.from === route.path && redirect(`/${locale}/${r.to}`))
}