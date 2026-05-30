/**
 * Session nonce approach:
 * - login() writes a random nonce to localStorage
 * - logout() deletes it
 * - On boot, if nonce is missing → session dead
 * - Interceptor can refresh tokens but NEVER writes the nonce
 * - So even if a stale refresh saves tokens after logout,
 *   the missing nonce kills the session on next boot
 */

function rand() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }
  
  const K = {
    NONCE: 'auth_nonce',
    TOKENS: 'auth_tokens',
    USER: 'auth_user',
  };
  
  // Module-level kill switch — synchronous, no race conditions
  let dead = false;
  
  const Store = {
    // ── Called ONLY by login/signup ──
    open(tokens, user) {
      dead = false;
      localStorage.setItem(K.NONCE, rand());
      localStorage.setItem(K.TOKENS, JSON.stringify(tokens));
      localStorage.setItem(K.USER, JSON.stringify(user));
    },
  
    // ── Called ONLY by logout ──
    destroy() {
      dead = true;
      localStorage.removeItem(K.NONCE);
      localStorage.removeItem(K.TOKENS);
      localStorage.removeItem(K.USER);
    },
  
    // ── Called by interceptor after token refresh ──
    writeTokens(tokens) {
      if (dead) return;
      // NEVER write nonce here — only login/signup can do that
      localStorage.setItem(K.TOKENS, JSON.stringify(tokens));
    },
  
    // ── Called by profile update ──
    writeUser(user) {
      if (dead) return;
      localStorage.setItem(K.USER, JSON.stringify(user));
    },
  
    // ── Reads ──
    hasSession() {
      if (dead) return false;
      return !!localStorage.getItem(K.NONCE);
    },
  
    tokens() {
      if (dead || !localStorage.getItem(K.NONCE)) return null;
      try { return JSON.parse(localStorage.getItem(K.TOKENS)); }
      catch { return null; }
    },
  
    access() {
      return this.tokens()?.access || null;
    },
  
    refresh() {
      return this.tokens()?.refresh || null;
    },
  
    user() {
      if (dead || !localStorage.getItem(K.NONCE)) return null;
      try { return JSON.parse(localStorage.getItem(K.USER)); }
      catch { return null; }
    },
  
    isDead() {
      return dead;
    },
  
    // Clean up orphaned data (tokens without nonce)
    cleanup() {
      if (!localStorage.getItem(K.NONCE)) {
        localStorage.removeItem(K.TOKENS);
        localStorage.removeItem(K.USER);
      }
    },
  };
  
  export default Store;