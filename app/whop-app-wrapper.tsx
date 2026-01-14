'use client'

import { WhopApp } from '@whop/react/components'

export default function WhopAppWrapper({ children }: { children: React.ReactNode }) {
  return <WhopApp>{children}</WhopApp>
}

