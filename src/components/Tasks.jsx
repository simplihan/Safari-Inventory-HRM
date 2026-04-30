import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

export default function Tasks() {
  const { user, profile } = useAuth()
  const [tasks, setTasks] = useState([])
  const [newTask, setNewTask] = useState({ title: '', description: '', type: 'Daily', due_date: '' })
  const [assignees, setAssignees] = useState([])
  const [selectedAssignee, setSelectedAssignee] = useState('')  // ✅ store UUID of selected user
  const [showCreate, setShowCreate] = useState(false)
  const isAdminOrManager = ['Admin', 'Manager'].includes(profile?.role)

  useEffect(() => {
    fetchTasks()
    if (isAdminOrManager) fetchUsers()
  }, [])

  async function fetchTasks() {
    let query = supabase.from('tasks').select('*')
    if (profile?.role === 'User') {
      query = query.eq('assigned_to', user.id)  // ✅ user.id is UUID
    }
    const { data, error } = await query
    if (error) console.error(error)
    else setTasks(data)
  }

  async function fetchUsers() {
    const { data } = await supabase.from('profiles').select('id, full_name, role').eq('role', 'User')
    setAssignees(data || [])
    if (data && data.length > 0) setSelectedAssignee(data[0].id)  // ✅ pre-select first user (UUID)
  }

  async function createTask() {
    if (!newTask.title || !newTask.due_date) return toast.error('Title and due date required')
    if (!selectedAssignee) return toast.error('Please select a user to assign this task')

    const { error } = await supabase.from('tasks').insert({
      title: newTask.title,
      description: newTask.description,
      type: newTask.type,
      due_date: newTask.due_date,
      assigned_to: selectedAssignee,   // ✅ UUID of selected user
      created_by: user.id,             // ✅ UUID of current user
      status: 'pending'
    })
    if (error) toast.error(error.message)
    else {
      toast.success('Task created')
      setNewTask({ title: '', description: '', type: 'Daily', due_date: '' })
      setShowCreate(false)
      fetchTasks()
    }
  }

  async function toggleComplete(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (error) toast.error(error.message)
    else fetchTasks()
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        {isAdminOrManager && (
          <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-cyan-600 text-white rounded">+ New Task</button>
        )}
      </div>
      <div className="space-y-3">
        {tasks.map(task => (
          <div key={task.id} className="bg-white dark:bg-gray-800 p-4 rounded shadow flex items-center justify-between">
            <div className="flex items-center gap-3">
              <input type="checkbox" checked={task.status === 'completed'} onChange={() => toggleComplete(task.id, task.status)} />
              <div>
                <h3 className="font-semibold">{task.title}</h3>
                <p className="text-sm text-gray-500">{task.description}</p>
                <p className="text-xs">Due: {new Date(task.due_date).toLocaleDateString()} | Type: {task.type}</p>
              </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs ${task.status === 'completed' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
              {task.status}
            </span>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded p-6 w-96">
            <h2 className="text-xl font-bold mb-4">Create Task</h2>
            <input type="text" placeholder="Title" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} className="w-full p-2 border rounded mb-2" />
            <textarea placeholder="Description" value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} className="w-full p-2 border rounded mb-2" />
            <select value={newTask.type} onChange={e => setNewTask({...newTask, type: e.target.value})} className="w-full p-2 border rounded mb-2">
              <option>Daily</option><option>Monthly</option>
            </select>
            <input type="date" value={newTask.due_date} onChange={e => setNewTask({...newTask, due_date: e.target.value})} className="w-full p-2 border rounded mb-2" />
            
            {/* ✅ Assignee dropdown with proper UUID value */}
            <select 
              value={selectedAssignee} 
              onChange={e => setSelectedAssignee(e.target.value)} 
              className="w-full p-2 border rounded mb-4"
            >
              {assignees.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 bg-gray-500 text-white rounded">Cancel</button>
              <button onClick={createTask} className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
