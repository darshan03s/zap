import { Outlet } from 'react-router'
import { Header } from './components/header'

export const RootLayout = () => {
  return (
    <>
      <Header />
      <Outlet />
    </>
  )
}
