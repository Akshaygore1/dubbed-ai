import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/components/ui/app-shell'
import { LandingPage } from '@/pages/landing-page'
import { AuthRoute, WorkspaceRoute } from './route-gates'

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
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
])
