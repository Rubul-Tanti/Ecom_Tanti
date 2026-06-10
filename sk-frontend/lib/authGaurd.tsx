'use client'

import { useUserContext } from '@/contextProvider'
import { useAuthentication } from '@/hooks/useAuthentication'
import { usePathname, useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const notAllowedWithLogin = ['/signin','/forgot-password']
const adminRoles = ['ADMIN', 'MODERATOR']

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const path = usePathname()
  const { loginWithAccessToken } = useAuthentication()
  const router = useRouter()
  const { user } = useUserContext()

  const isProtected = path.startsWith('/admin')
  const isAuthRoute = notAllowedWithLogin.includes(path)
  const hasAdminAccess = user.role !== null && adminRoles.includes(user.role)

  useEffect(() => {
    const token = localStorage.getItem('access_token')

    if (!user.isAuthenticated && token) {
      console.log('pass')
      loginWithAccessToken.mutate()
      return
    }

    if (!user.isAuthenticated && isProtected) {
      router.replace('/signin')
      return
    }

    if (user.isAuthenticated && isProtected && !hasAdminAccess) {
      router.replace('/')
      return
    }

    if (user.isAuthenticated && isAuthRoute) {
      router.replace('/')
    }

  }, [path, user.isAuthenticated, user.role])

  if (!user.isAuthenticated && isProtected) return null
  if (user.isAuthenticated && isProtected && !hasAdminAccess) return null
  if (user.isAuthenticated && isAuthRoute) return null

  return <>{children}</>
}

export default AuthGuard