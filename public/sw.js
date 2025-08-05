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
    // Armazena a URL na notificação
    data: {
      url: data.url, // URL específica para navegar
    },
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})

self.addEventListener('notificationclick', function (event) {
  event.notification.close()

  // Pega a URL dos dados da notificação ou usa fallback
  const targetUrl = event.notification.data?.url || '/admin/purchases'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i]

          // Verifica se já existe uma janela aberta da aplicação
          if (client.url.includes(self.location.origin)) {
            // Foca e navega para a URL correta
            client.focus()
            return client.navigate(targetUrl)
          }
        }
        // Se não encontrou janela aberta, abre nova aba
        return self.clients.openWindow(targetUrl)
      }),
  )
})
