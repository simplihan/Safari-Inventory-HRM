export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h ${mins}m`;
}

export function formatTime(date: Date | string): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getCurrentStatusFromEntries(entries: any[]): 'active' | 'break' | 'offline' {
  const lastOpen = entries.find(e => !e.end_time);
  if (!lastOpen) return 'offline';
  return lastOpen.type === 'work' ? 'active' : 'break';
}
