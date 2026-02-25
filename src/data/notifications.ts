/* ================================
   Types
================================ */

export type ScheduledNotification = {
  id: string
  appId: string
  iconKey: string
  title: string
  subtitle: string
  delayMs: number
  elapsedMs: number
  triggered: boolean
}

export type ActiveNotification = {
  id: string
  appId: string
  iconKey: string
  title: string
  subtitle: string
  timestamp: number
}

/* ================================
   Storage Keys
================================ */

const SCHEDULED_KEY = 'os_scheduled_notifications'
const ACTIVE_KEY = 'os_active_notifications'
const LAST_TICK_KEY = 'os_notification_last_tick'

/* ================================
   Utilities
================================ */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

/* ================================
   Demo Seed Data (ONE-TIME)
================================ */

export function seedDemoNotifications() {
  const existing = load<ScheduledNotification[]>(SCHEDULED_KEY, [])
  if (existing.length > 0) return

  const demo: ScheduledNotification[] = [
    {
      id: 'whatsapp_1',
      appId: 'whatsapp',
      iconKey: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Alex sent you a message',
      delayMs: 40_000,
      elapsedMs: 0,
      triggered: false,
    },
    {
      id: 'instagram_1',
      appId: 'instagram',
      iconKey: 'instagram',
      title: 'Instagram',
      subtitle: 'New follower',
      delayMs: 300_000,
      elapsedMs: 0,
      triggered: false,
    },
    {
      id: 'telegram_1',
      appId: 'telegram',
      iconKey: 'instagram',
      title: 'Telegram',
      subtitle: 'Message from Trading Group',
      delayMs: 10_000,
      elapsedMs: 0,
      triggered: false,
    },
    {
      id: 'system_1',
      appId: 'system',
      iconKey: 'facebook',
      title: 'System',
      subtitle: 'Battery optimization enabled',
      delayMs: 20_000,
      elapsedMs: 0,
      triggered: false,
    },
     {
      id: 'whatsapp_2',
      appId: 'whatsapp',
      iconKey: 'whatsapp',
      title: 'WhatsApp',
      subtitle: 'Alex sent you a message',
      delayMs: 60_000,
      elapsedMs: 0,
      triggered: false,
    },
     {
      id: 'telegram_2',
      appId: 'telegram',
      iconKey: 'facebook',
      title: 'Telegram',
      subtitle: 'Message from Trading Group',
      delayMs: 10_000,
      elapsedMs: 0,
      triggered: false,
    },
     {
      id: 'snapchat_1',
      appId: 'snapchat',
      iconKey: 'whatsapp',
      title: 'Snapchat',
      subtitle: 'Message from Trading Group',
      delayMs: 10_000,
      elapsedMs: 0,
      triggered: false,
    },
  ]

  save(SCHEDULED_KEY, demo)
  save(ACTIVE_KEY, [])
  save(LAST_TICK_KEY, Date.now())
}

/* ================================
   Scheduler
================================ */

let schedulerStarted = false

export function startNotificationScheduler() {
  if (schedulerStarted) return
  schedulerStarted = true
  setInterval(tickNotifications, 1000)
}

function tickNotifications() {
  const now = Date.now()
  const lastTick = load<number>(LAST_TICK_KEY, now)
  const delta = now - lastTick

  let scheduled = load<ScheduledNotification[]>(SCHEDULED_KEY, [])
  let active = load<ActiveNotification[]>(ACTIVE_KEY, [])

  scheduled = scheduled.map(n => {
    if (n.triggered) return n

    const elapsed = n.elapsedMs + delta

    if (elapsed >= n.delayMs) {
      active.push({
        id: n.id,
        appId: n.appId,
        iconKey: n.iconKey,
        title: n.title,
        subtitle: n.subtitle,
        timestamp: now,
      })

      return {
        ...n,
        elapsedMs: n.delayMs,
        triggered: true,
      }
    }

    return {
      ...n,
      elapsedMs: elapsed,
    }
  })

  save(SCHEDULED_KEY, scheduled)
  save(ACTIVE_KEY, active)
  save(LAST_TICK_KEY, now)
}

/* ================================
   Public API (UI)
================================ */

export function getActiveNotifications(): ActiveNotification[] {
  return load<ActiveNotification[]>(ACTIVE_KEY, [])
}

export function clearAllNotifications() {
  save(ACTIVE_KEY, [])
}

export function dismissNotification(id: string) {
  const active = load<ActiveNotification[]>(ACTIVE_KEY, [])
  save(
    ACTIVE_KEY,
    active.filter(n => n.id !== id)
  )
}

/* ================================
   Developer / Debug Controls
================================ */

export function resetDemoNotifications() {
  const scheduled = load<ScheduledNotification[]>(SCHEDULED_KEY, [])

  const reset = scheduled.map(n => ({
    ...n,
    elapsedMs: 0,
    triggered: false,
  }))

  save(SCHEDULED_KEY, reset)
  save(ACTIVE_KEY, [])
  save(LAST_TICK_KEY, Date.now())
}

/* ================================
   Collapsed Bar Helpers
================================ */

export function getCollapsedIcons(maxIcons = 3): string[] {
  const active = load<ActiveNotification[]>(ACTIVE_KEY, [])
  const unique = Array.from(new Set(active.map(n => n.iconKey)))

  return unique.length <= maxIcons ? unique : unique.slice(0, maxIcons)
}

export function hasOverflowIcons(maxIcons = 3): boolean {
  const active = load<ActiveNotification[]>(ACTIVE_KEY, [])
  const unique = new Set(active.map(n => n.iconKey))
  return unique.size > maxIcons
}