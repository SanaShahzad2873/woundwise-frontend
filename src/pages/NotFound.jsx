import { Link } from 'react-router-dom'
import PageHeader from '../components/ui/PageHeader'

export default function NotFound() {
  return (
    <div>
      <PageHeader
        title="Page not found"
        subtitle="The page you are looking for does not exist."
      />
      <Link
        to="/"
        className="inline-flex rounded-lg bg-ww-navy px-4 py-2 text-sm font-medium text-white hover:bg-ww-navy/90"
      >
        Back to dashboard
      </Link>
    </div>
  )
}