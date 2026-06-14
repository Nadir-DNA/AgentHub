import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen text-white" style={{ position: 'relative', zIndex: 1 }}>
      <Outlet />
    </div>
  )
}
