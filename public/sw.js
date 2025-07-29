self.addEventListener('push', function (event) {
  let data = { title: 'Pinest', body: 'Você tem uma nova notificação' }

  try {
    data = event.data.json()
  } catch {
    data.body = event.data.text()
  }

  const icon = data.icon || '/icon.svg'

  console.log('data:', data)

  const options = {
    body: data.body,
    icon,
    requireInteraction: true,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]
          // Verifica se já está em /admin/purchases ou em qualquer página da sua origem
          if (client.url.includes('/admin')) {
            // Foca e navega para /admin/purchases
            client.focus()
            client.navigate('/admin/purchases')
            return
          }
        }
        // Se não encontrou, abre nova aba
        return self.clients.openWindow('/admin/purchases')
      }),
  )
})
