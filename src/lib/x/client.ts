import { supabase } from '@/lib/supabase/client'

const X_API_BASE = 'https://api.twitter.com/2'

interface TwitterCredentials {
  bearerToken: string
  accessToken: string
  accessTokenSecret: string
  clientId: string
  clientSecret: string
}

function getCredentials(): TwitterCredentials {
  return {
    bearerToken: process.env.X_BEARER_TOKEN!,
    accessToken: process.env.X_ACCESS_TOKEN!,
    accessTokenSecret: process.env.X_ACCESS_TOKEN_SECRET!,
    clientId: process.env.X_CLIENT_ID!,
    clientSecret: process.env.X_CLIENT_SECRET!,
  }
}

// OAuth 1.0a signature for posting tweets
function buildOAuthHeader(method: string, url: string, params: Record<string, string>): string {
  const creds = getCredentials()
  const nonce = Math.random().toString(36).substring(2)
  const timestamp = Math.floor(Date.now() / 1000).toString()

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: creds.clientId,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: creds.accessToken,
    oauth_version: '1.0',
  }

  // In production: compute HMAC-SHA1 signature properly
  // This is a placeholder — use a library like 'oauth-1.0a' in real implementation
  const allParams = { ...params, ...oauthParams }
  const paramStr = Object.keys(allParams)
    .sort()
    .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(allParams[k])}`)
    .join('&')

  const sigBase = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(paramStr)}`
  const sigKey = `${encodeURIComponent(creds.clientSecret)}&${encodeURIComponent(creds.accessTokenSecret)}`

  // TODO: replace with actual HMAC-SHA1 — add 'oauth-1.0a' and 'crypto' packages
  const signature = Buffer.from(`${sigBase}:${sigKey}`).toString('base64')

  oauthParams['oauth_signature'] = signature
  const headerStr = Object.keys(oauthParams)
    .map((k) => `${k}="${encodeURIComponent(oauthParams[k])}"`)
    .join(', ')

  return `OAuth ${headerStr}`
}

export async function postTweet(content: string): Promise<{ id: string; text: string } | null> {
  const url = `${X_API_BASE}/tweets`
  const oauthHeader = buildOAuthHeader('POST', url, {})

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: oauthHeader,
      },
      body: JSON.stringify({ text: content }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('[x] postTweet failed:', err)
      return null
    }

    const data = await res.json()
    const tweet = data.data

    // Save to Supabase
    await supabase.from('social_posts').insert({
      tweet_id: tweet.id,
      content: tweet.text,
      posted_at: new Date().toISOString(),
      status: 'published',
    })

    return tweet
  } catch (err) {
    console.error('[x] postTweet error:', err)
    return null
  }
}

export async function getRecentPosts(limit = 3): Promise<string[]> {
  const { data } = await supabase
    .from('social_posts')
    .select('content')
    .order('posted_at', { ascending: false })
    .limit(limit)

  return (data ?? []).map((p) => p.content)
}
