import { Route, Routes } from 'react-router'
import { Index } from './pages'
import { RootLayout } from './root-layout'

export const Router = () => {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route index path="/" element={<Index />} />
      </Route>
    </Routes>
  )
}
