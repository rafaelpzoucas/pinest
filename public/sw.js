self.addEventListener('push', function (event) {
  let data = { title: 'Pinest', body: 'Você tem uma nova notificação' }

  try {
    data = event.data.json()
  } catch {
    data.body = event.data.text()
  }

  const options = {
    body: data.body,
    icon: '/icon.svg',
    requireInteraction: true,
  }

  event.waitUntil(self.registration.showNotification(data.title, options))
})
