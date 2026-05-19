import { createBrowserRouter } from 'react-router-dom'
import { AppShell } from '@/components/ui/app-shell'
import { HomePage } from '@/pages/home-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
    ],
  },
])
