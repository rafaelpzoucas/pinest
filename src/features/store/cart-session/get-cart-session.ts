'use server'

import { cookies } from 'next/headers'
import { v4 as uuidv4 } from 'uuid'

async function createStoreCartSession(storeUrl: string) {
  const cookieStore = cookies()
  const uuid = uuidv4()

  try {
    cookieStore.set(`${storeUrl}_cart_session`, uuid)
    return cookieStore.get(`${storeUrl}_cart_session`)
  } catch (error) {
    console.error('Error setting cookie:', error)
  }
}

export async function getStoreCartSession(storeSubdomain: string) {
  const cookieStore = cookies()

  const session = cookieStore.get(`${storeSubdomain}_cart_session`)

  if (!session) {
    const createdSession = await createStoreCartSession(storeSubdomain)

    if (createdSession) {
      return createdSession
    }
  }

  return session
}
