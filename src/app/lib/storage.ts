export interface Profile {
  id: string
  email: string
  username: string
  balance: number
  total_wagered: number
  total_won: number
  created_at: string
  updated_at: string
  achievements: string[]
}

export interface GameHistory {
  id: string
  user_id: string
  game_type: 'slots' | 'roleta' | 'blackjack'
  bet_amount: number
  payout_amount: number
  game_data: unknown
  created_at: string
  balance_after: number
}

interface User {
  id: string
  email: string
  password: string
}

const STORAGE_KEYS = {
  USERS: 'casino_users',
  PROFILES: 'casino_profiles',
  GAME_HISTORY: 'casino_game_history',
  CURRENT_USER: 'casino_current_user',
}

function generateShortSafeId(size = 21) {
  const alphabet = 'ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUImOPlmeqKzLWhjdnxMyXJSwuZK'
  const alphabetLength = alphabet.length

  const bytes = new Uint8Array(size)
  
  crypto.getRandomValues(bytes)

  let id = ''
  for (let i = 0; i < size; i++) {
    id += alphabet[bytes[i] % alphabetLength]
  }

  return id
}

export class LocalStorage {
  private static getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS)
    return data ? JSON.parse(data) : []
  }

  private static setUsers(users: User[]): void {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users))
  }

  private static getProfiles(): Profile[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILES)
    return data ? JSON.parse(data) : []
  }

  private static setProfiles(profiles: Profile[]): void {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(profiles))
  }

  static getGameHistory(): GameHistory[] {
    const data = localStorage.getItem(STORAGE_KEYS.GAME_HISTORY)
    return data ? JSON.parse(data) : []
  }

  private static setGameHistory(history: GameHistory[]): void {
    localStorage.setItem(STORAGE_KEYS.GAME_HISTORY, JSON.stringify(history))
  }

  static getCurrentUser(): { id: string; email: string } | null {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER)
    return data ? JSON.parse(data) : null
  }

  private static setCurrentUser(user: { id: string; email: string } | null): void {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user))
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER)
    }
  }

  static signUp(email: string, password: string, username: string): Promise<{ user: { id: string; email: string } }> {
    return new Promise((resolve, reject) => {
      const users = this.getUsers()

      if (users.some(u => u.email === email)) {
        reject(new Error('Usuário já existe'))
        return
      }

      const profiles = this.getProfiles()
      if (profiles.some(p => p.username === username)) {
        reject(new Error('Nome de usuário já utilizado'))
        return
      }

      const id = generateShortSafeId()
      const user = { id, email, password }

      users.push(user)
      this.setUsers(users)

      const profile: Profile = {
        id,
        email,
        username,
        balance: 1000,
        total_wagered: 0,
        total_won: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        achievements: [],
      }

      profiles.push(profile)
      this.setProfiles(profiles)

      this.setCurrentUser({ id, email })
      resolve({ user: { id, email } })
    })
  }

  static signIn(email: string, password: string): Promise<{ user: { id: string; email: string } }> {
    return new Promise((resolve, reject) => {
      const users = this.getUsers()
      const user = users.find(u => u.email === email && u.password === password)

      if (!user) {
        reject(new Error('Senha ou email inválidos'))
        return
      }

      this.setCurrentUser({ id: user.id, email: user.email })
      resolve({ user: { id: user.id, email: user.email } })
    })
  }

  static signOut(): Promise<void> {
    return new Promise((resolve) => {
      this.setCurrentUser(null)
      resolve()
    })
  }

  static getProfile(userId: string): Profile | null {
    const profiles = this.getProfiles()
    return profiles.find(p => p.id === userId) || null
  }

  static updateProfile(userId: string, updates: Partial<Profile>): Promise<void> {
    return new Promise((resolve) => {
      const profiles = this.getProfiles()
      const index = profiles.findIndex(p => p.id === userId)

      if (index !== -1) {
        profiles[index] = {
          ...profiles[index],
          ...updates,
          updated_at: new Date().toISOString(),
        }
        this.setProfiles(profiles)
      }

      resolve()
    })
  }

  static addGameHistory(game: Omit<GameHistory, 'id' | 'created_at'>): Promise<void> {
    return new Promise((resolve) => {
      const history = this.getGameHistory()
      const newGame: GameHistory = {
        ...game,
        id: generateShortSafeId(),
        created_at: new Date().toISOString(),
      }

      history.push(newGame)
      this.setGameHistory(history)
      this.checkAchievements(game.user_id)
      resolve()
    })
  }

  static checkAchievements(userId: string) {
    const profile = this.getProfile(userId)
    if (!profile) return

    const userHistory = this.getGameHistoryForUser(userId)
    const newAchievements = [...(profile.achievements || [])]

    if (userHistory.length >= 50 && !newAchievements.includes("sobreviveu_50")) {
      newAchievements.push("sobreviveu_50")
    }

    if (profile.balance <= 0 && userHistory.length < 10 && !newAchievements.includes("quebrou_rapido")) {
      newAchievements.push("quebrou_rapido")
    }

    const roletaHistory = userHistory.filter(g => g.game_type === 'roleta')
    if (roletaHistory.some(g => g.bet_amount > 0 && (g.payout_amount / g.bet_amount) >= 2) && !newAchievements.includes("multiplicador_2x")) {
        newAchievements.push("multiplicador_2x")
    }

    if (newAchievements.length > (profile.achievements || []).length) {
      this.updateProfile(userId, { achievements: newAchievements })
    }
  }

  static getGameHistoryForUser(userId: string, limit?: number): GameHistory[] {
    const history = this.getGameHistory()
    const userHistory = history
      .filter(h => h.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return limit ? userHistory.slice(0, limit) : userHistory
  }
}