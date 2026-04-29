import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Profile() {
  const { profile, updateProfile, changePassword } = useAuth()
  const [image, setImage] = useState(null)
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState('')

  async function handleImageUpload(e) {
    const file = e.target.files[0]
    // upload to supabase storage (simplified - you'll need bucket)
    toast.success('Image upload demo - implement storage')
  }

  async function handlePasswordChange() {
    try {
      await changePassword(oldPass, newPass)
      setOldPass(''); setNewPass('')
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      <div className="bg-white dark:bg-gray-800 rounded shadow p-6 space-y-6">
        <div className="flex items-center gap-4">
          <img src={profile?.avatar_url || `/default-avatar-${profile?.gender}.png`} className="w-20 h-20 rounded-full" />
          <div>
            <p className="text-xl font-semibold">{profile?.full_name}</p>
            <p className="text-gray-500">{profile?.role}</p>
          </div>
        </div>
        <div>
          <label>Change Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
        <div className="border-t pt-4">
          <h2 className="font-bold mb-2">Change Password</h2>
          <input type="password" placeholder="Old Password" value={oldPass} onChange={e => setOldPass(e.target.value)} className="w-full p-2 border rounded mb-2" />
          <input type="password" placeholder="New Password" value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full p-2 border rounded mb-2" />
          <button onClick={handlePasswordChange} className="px-4 py-2 bg-blue-600 text-white rounded">Update Password</button>
        </div>
      </div>
    </div>
  )
}
