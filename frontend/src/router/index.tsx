import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/ui/app-shell'
import { LandingPage } from '@/pages/landing-page'
import {
  AdminAnalyticsRoute,
  AdminLoginRoute,
  AdminUsersRoute,
  AuthRoute,
  PendingRoute,
  WorkspaceRoute,
} from './route-gates'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'auth',
        element: <AuthRoute />,
      },
      {
        path: 'workspace',
        element: <WorkspaceRoute />,
      },
      {
        path: 'pending',
        element: <PendingRoute />,
      },
      {
        path: 'admin/login',
        element: <AdminLoginRoute />,
      },
      {
        path: 'admin/users',
        element: <AdminUsersRoute />,
      },
      {
        path: 'admin/analytics',
        element: <AdminAnalyticsRoute />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
