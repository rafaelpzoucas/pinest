// pages/api/update-payout-account.js

import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { NextApiRequest, NextApiResponse } from 'next'

const supabase = createClient()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'POST') {
    const { userId, bankAccount } = req.body

    const { data: user, error: userError } = await supabase
      .from('users')
      .select('stripe_account_id')
      .eq('id', userId)
      .single()

    if (userError) {
      res.status(500).json({ error: 'User not found' })
      return
    }

    try {
      await stripe.accounts.update(user.stripe_account_id, {
        external_account: bankAccount, // ex: 'btok_1J2YXY2eZvKYlo2C0lN97E3N'
      })

      res.status(200).json({ success: true })
    } catch (error) {
      res.status(500).json({ error })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}
