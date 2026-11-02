'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { sign, safeEqual, hashPassword, verifyPassword, randomToken } = require('./utils');

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

class SecurityHeaders {
  static middleware(res, { cspNonce } = {}) {
    const csp = [
      "default-src 'self'",
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      `script-src 'self'${cspNonce ? ` 'nonce-${cspNonce}'` : ''}`,
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'"
    ].join('; ');
    res.setHeader('Content-Security-Policy', csp);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  }
}

class RateLimiter {
  constructor({ windowMs = 60000, max = 30 } = {}) {
    this.windowMs = windowMs;
    this.max = max;
    this.hits = new Map();
    setInterval(() => this.sweep(), windowMs).unref();
  }
  sweep() {
    const now = Date.now();
    for (const [key, arr] of this.hits) {
      const fresh = arr.filter(t => now - t < this.windowMs);
      if (fresh.length) this.hits.set(key, fresh); else this.hits.delete(key);
    }
  }
  check(key) {
    const now = Date.now();
    const arr = (this.hits.get(key) || []).filter(t => now - t < this.windowMs);
    if (arr.length >= this.max) {
      this.hits.set(key, arr);
      return { allowed: false, retryAfter: Math.ceil((arr[0] + this.windowMs - now) / 1000) };
    }
    arr.push(now);
    this.hits.set(key, arr);
    return { allowed: true };
  }
}

class SessionStore {
  constructor(file, secret) {
    this.file = file;
    this.secret = secret;
    this.sessions = new Map();
    this.load();
  }
  load() {
    try {
      const data = JSON.parse(fs.readFileSync(this.file, 'utf8'));
      const now = Date.now();
      for (const [id, s] of Object.entries(data)) {
        if (s.expires > now) this.sessions.set(id, s);
      }
    } catch { /* premier démarrage */ }
  }
  save() {
    const obj = {};
    for (const [id, s] of this.sessions) obj[id] = s;
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    fs.writeFileSync(this.file, JSON.stringify(obj), 'utf8');
  }
  create(userId) {
    const id = randomToken(24);
    const expires = Date.now() + SESSION_TTL_MS;
    this.sessions.set(id, { userId, expires });
    this.save();
    return { id, expires, sig: sign(id + '.' + expires, this.secret) };
  }
  verify(cookieValue) {
    if (!cookieValue) return null;
    const [id, expiresStr, sig] = String(cookieValue).split('.');
    if (!id || !expiresStr || !sig) return null;
    const expires = Number(expiresStr);
    if (!safeEqual(sign(id + '.' + expires, this.secret), sig)) return null;
    if (Date.now() > expires) return null;
    const s = this.sessions.get(id);
    if (!s || s.expires !== expires) return null;
    return s;
  }
  destroy(cookieValue) {
    if (!cookieValue) return;
    const id = String(cookieValue).split('.')[0];
    this.sessions.delete(id);
    this.save();
  }
}

class AdminAuth {
  constructor(siteRoot, secret) {
    this.credentialsFile = path.join(siteRoot, '.admin.json');
    this.sessions = new SessionStore(path.join(siteRoot, '.sessions.json'), secret);
    this.secret = secret;
    if (!fs.existsSync(this.credentialsFile)) {
      const password = process.env.ADMIN_PASSWORD || randomToken(16);
      fs.mkdirSync(siteRoot, { recursive: true });
      fs.writeFileSync(this.credentialsFile, JSON.stringify({
        user: 'admin',
        ...hashPassword(password),
        createdAt: new Date().toISOString()
      }, null, 2), { encoding: 'utf8', mode: 0o600 });
      console.log('[admin] Aucun compte trouvé : mot de passe initial généré dans .admin.json');
      console.log('[admin] Pour le définir toi-même : ADMIN_PASSWORD=tonMotDePasse node cli.js dev');
    }
  }
  verifyLogin(user, password) {
    try {
      const c = JSON.parse(fs.readFileSync(this.credentialsFile, 'utf8'));
      return c.user === user && verifyPassword(password, c);
    } catch { return false; }
  }
  sessionCookie(session) {
    return `arcadia_session=${session.id}.${session.expires}.${session.sig}; Path=/; HttpOnly; SameSite=Strict; Secure`;
  }
  isLoggedIn(req) {
    const cookie = req.headers.cookie || '';
    const m = cookie.match(/arcadia_session=([^;]+)/);
    return !!(m && this.sessions.verify(m[1]));
  }
}

class Csrf {
  constructor(secret) { this.secret = secret; }
  issue(sessionId) {
    return sign(sessionId + ':csrf', this.secret);
  }
  verify(sessionId, token) {
    if (!token) return false;
    return safeEqual(this.issue(sessionId), token);
  }
}

module.exports = { SecurityHeaders, RateLimiter, SessionStore, AdminAuth, Csrf };
