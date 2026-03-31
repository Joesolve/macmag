import { redirect } from 'next/navigation'

// Default /staff → /staff/checkin
export default function StaffPage() {
  redirect('/staff/checkin')
}
