export default function ({ route, redirect }) {
  const redirects = [
    { from: '/', to: '/dashboard' }
  ]

  redirects.map(r => r.from === route.path && redirect(r.to))
}