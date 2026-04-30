import { useEffect, useState } from 'react'
import { supabase } from '../supabase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts'
import { Users, Activity, Coffee, WifiOff, RefreshCw, TrendingUp, Clock } from 'lucide-react'

const STATUS_CFG = {
  Active:     { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  dot: '#10B981' },
  'On Break': { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)',  dot: '#F59E0B' },
  Offline:    { color: '#6B7280', bg: 'rgba(107,114,128,0.04)', border: 'rgba(107,114,128,0.12)', dot: '#374151' },
}

const formatTime = (mins) => {
  if (!mins || mins <= 0) return '0h 0m'
  return `${Math.floor(mins / 60)}h ${mins % 60}m`
}

const fmtClock = (ts) =>
  ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'

export default function Dashboard() {
  const { profile } = useAuth()
  const [users, setUsers]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => {
    fetchUsers()
    const channel = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'time_logs' }, fetchUsers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' },  fetchUsers)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function fetchUsers() {
    setLoading(true)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, full_name, user_id, gender, role, avatar_url')

    if (error) {
      toast.error('Failed to load dashboard')
      setLoading(false)
      return
    }
    if (!profiles?.length) { setUsers([]); setLoading(false); return }

    const today = new Date().toISOString().split('T')[0]

    const enhanced = await Promise.all(profiles.map(async (u) => {
      const { data: lastLog } = await supabase
        .from('time_logs').select('*')
        .eq('user_id', u.id).eq('date', today)
        .order('in_time', { ascending: false }).limit(1)

      let status = 'Offline', lastIn = null, lastOut = null,
          totalWork = 0, totalBreak = 0

      if (lastLog?.[0]) {
        const log = lastLog[0]
        lastIn = log.in_time
        if (log.out_time && !log.return_time) { status = 'On Break'; lastOut = log.out_time }
        else if (log.in_time && !log.out_time)  { status = 'Active' }

        const { data: daily } = await supabase
          .from('time_logs').select('in_time, out_time, return_time')
          .eq('user_id', u.id).eq('date', today)

        daily?.forEach(l => {
          if (l.in_time && l.out_time && l.return_time) {
            totalWork  += (new Date(l.out_time) - new Date(l.in_time)) / 60000
            totalBreak += (new Date(l.return_time) - new Date(l.out_time)) / 60000
          } else if (l.in_time && l.out_time && !l.return_time) {
            totalBreak += (new Date() - new Date(l.out_time)) / 60000
          } else if (l.in_time && !l.out_time) {
            totalWork  += (new Date() - new Date(l.in_time)) / 60000
          }
        })
      }

      return {
        ...u, status, last_in_time: lastIn, last_out_time: lastOut,
        total_worked_today: Math.round(totalWork),
        total_break_today:  Math.round(totalBreak),
      }
    }))

    setUsers(enhanced)
    setLastUpdated(new Date())
    setLoading(false)
  }

  const getAvatarUrl = (user) => {
    if (user.avatar_url) return user.avatar_url
    const gender = user.gender?.toLowerCase() || 'male'
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=${gender === 'male' ? '0D8ABC' : 'D23669'}&color=fff&size=128`
  }

  const active   = users.filter(u => u.status === 'Active').length
  const onBreak  = users.filter(u => u.status === 'On Break').length
  const offline  = users.filter(u => u.status === 'Offline').length

  const chartData = users
    .filter(u => u.total_worked_today > 0)
    .sort((a, b) => b.total_worked_today - a.total_worked_today)
    .map(u => ({
      name:  u.full_name.split(' ')[0],
      work:  u.total_worked_today,
      break: u.total_break_today,
    }))

  const STAT_CARDS = [
    { label: 'Total Staff', value: users.length, icon: Users,     color: '#818CF8', bg: 'rgba(129,140,248,0.08)', border: 'rgba(129,140,248,0.2)' },
    { label: 'Active',      value: active,        icon: Activity,  color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.2)' },
    { label: 'On Break',    value: onBreak,       icon: Coffee,    color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Offline',     value: offline,       icon: WifiOff,   color: '#6B7280', bg: 'rgba(107,114,128,0.06)', border: 'rgba(107,114,128,0.15)' },
  ]

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#0B1120', minHeight: '100vh', padding: '28px 24px', color: '#fff' }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.03em', margin: 0 }}>
            Team Dashboard
          </h1>
          <p style={{ color: '#4B5563', fontSize: 13, marginTop: 4 }}>
            Live attendance · Updated {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <button
          onClick={fetchUsers}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 10,
                   background: 'transparent', border: '1px solid #1F2937', color: '#6B7280',
                   cursor: 'pointer', fontSize: 13, transition: 'all .2s' }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#374151'; e.currentTarget.style.color = '#D1D5DB' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#1F2937'; e.currentTarget.style.color = '#6B7280' }}
        >
          <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: '18px 20px',
                                    display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ background: `${color}1A`, color, padding: 10, borderRadius: 10, flexShrink: 0 }}>
              <Icon size={18} />
            </div>
            <div>
              <p style={{ color, fontSize: 26, fontWeight: 700, margin: 0, lineHeight: 1, fontFamily: "'Sora', sans-serif" }}>{value}</p>
              <p style={{ color: '#6B7280', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 260, gap: 12 }}>
          <div style={{ width: 32, height: 32, border: '2px solid #F59E0B', borderTopColor: 'transparent',
                        borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <p style={{ color: '#4B5563', fontSize: 13 }}>Loading team data…</p>
        </div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#4B5563', paddingTop: 80 }}>No team members found.</div>
      ) : (
        <>
          {/* ── Bar Chart ─────────────────────────────────────────── */}
          {chartData.length > 0 && (
            <div style={{ background: '#111827', border: '1px solid #1F2937', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
              <p style={{ fontFamily: "'Sora', sans-serif", fontSize: 12, fontWeight: 600, color: '#6B7280',
                          textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 16px',
                          display: 'flex', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={13} color="#F59E0B" /> Today's Activity (minutes)
              </p>
              <ResponsiveContainer width="100%" height={170}>
                <BarChart data={chartData} barCategoryGap="35%">
                  <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1F2937', border: '1px solid #374151', borderRadius: 8,
                                    color: '#fff', fontSize: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="work"  name="Worked" fill="#10B981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="break" name="Break"  fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* ── User Cards ────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {users.map(user => {
              const cfg     = STATUS_CFG[user.status]
              const workPct = Math.min((user.total_worked_today / 480) * 100, 100)

              return (
                <div key={user.id}
                     style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 16,
                              padding: 20, transition: 'transform .15s, box-shadow .15s', cursor: 'default' }}
                     onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.3)` }}
                     onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = 'none' }}
                >
                  {/* Avatar + Name */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <img src={getAvatarUrl(user)} alt={user.full_name}
                           style={{ width: 52, height: 52, borderRadius: 12, objectFit: 'cover', display: 'block' }} />
                      <span style={{ position: 'absolute', bottom: -2, right: -2, width: 13, height: 13,
                                     background: cfg.dot, borderRadius: '50%', border: '2px solid #0B1120', display: 'block' }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: '#F9FAFB', fontSize: 15, margin: 0,
                                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user.full_name}
                          </p>
                          <p style={{ color: '#6B7280', fontSize: 12, marginTop: 3 }}>
                            {user.role} · {user.user_id}
                          </p>
                        </div>
                        <span style={{ color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
                                       fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, flexShrink: 0 }}>
                          {user.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Work Progress */}
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: '#6B7280', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} /> Work today
                      </span>
                      <span style={{ color: cfg.color, fontSize: 12, fontWeight: 600 }}>
                        {formatTime(user.total_worked_today)}
                      </span>
                    </div>
                    <div style={{ height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 99, overflow: 'hidden' }}>
                      <div style={{ width: `${workPct}%`, height: '100%', background: cfg.color,
                                    borderRadius: 99, transition: 'width .6s ease' }} />
                    </div>
                    <p style={{ color: '#374151', fontSize: 10, marginTop: 4 }}>
                      {workPct.toFixed(0)}% of 8hr shift
                    </p>
                  </div>

                  {/* Time Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Clock In',  value: fmtClock(user.last_in_time) },
                      { label: 'Clock Out', value: fmtClock(user.last_out_time) },
                      { label: 'Break',     value: formatTime(user.total_break_today) },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                                borderRadius: 10, padding: '8px 6px', textAlign: 'center' }}>
                        <p style={{ color: '#4B5563', fontSize: 10, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
                        <p style={{ color: '#D1D5DB', fontSize: 12, fontWeight: 500 }}>{value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
