import { supabase } from './supabase'

const SESSION_TIMEOUT = 30 * 60 * 1000 // 30 minutes in milliseconds
const WARNING_TIME = 5 * 60 * 1000 // 5 minutes before timeout

export class SessionManager {
  private timeoutId: NodeJS.Timeout | null = null
  private warningTimeoutId: NodeJS.Timeout | null = null
  private lastActivity: number = Date.now()
  private onWarning?: () => void
  private onTimeout?: () => void

  constructor(onWarning?: () => void, onTimeout?: () => void) {
    this.onWarning = onWarning
    this.onTimeout = onTimeout
    this.startTracking()
  }

  private startTracking() {
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.addEventListener(event, this.resetTimer.bind(this), true)
    })

    this.resetTimer()
  }

  private resetTimer() {
    this.lastActivity = Date.now()
    
    // Clear existing timers
    if (this.timeoutId) clearTimeout(this.timeoutId)
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId)

    // Set warning timer
    this.warningTimeoutId = setTimeout(() => {
      this.onWarning?.()
    }, SESSION_TIMEOUT - WARNING_TIME)

    // Set timeout timer
    this.timeoutId = setTimeout(() => {
      this.handleTimeout()
    }, SESSION_TIMEOUT)
  }

  private async handleTimeout() {
    await supabase.auth.signOut()
    this.onTimeout?.()
  }

  public extendSession() {
    this.resetTimer()
  }

  public destroy() {
    if (this.timeoutId) clearTimeout(this.timeoutId)
    if (this.warningTimeoutId) clearTimeout(this.warningTimeoutId)
    
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart']
    events.forEach(event => {
      document.removeEventListener(event, this.resetTimer.bind(this), true)
    })
  }

  public getRemainingTime(): number {
    return Math.max(0, SESSION_TIMEOUT - (Date.now() - this.lastActivity))
  }
}