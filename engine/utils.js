'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

const slugify = (str) => String(str)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 90) || 'article-' + Date.now();

const safeJoin = (root, rel) => {
  const p = path.normalize(path.join(root, rel));
  if (!p.startsWith(path.normalize(root) + path.sep) && p !== path.normalize(root)) {
    throw new Error('Chemin interdit (path traversal) : ' + rel);
  }
  return p;
};

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));

const writeJson = (file, data) => {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

const randomToken = (bytes = 32) => crypto.randomBytes(bytes).toString('hex');

const sign = (value, secret) => crypto.createHmac('sha256', secret).update(value).digest('hex');

const safeEqual = (a, b) => {
  const ba = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return { salt, hash };
};

const verifyPassword = (password, stored) => {
  const { hash } = hashPassword(password, stored.salt);
  return safeEqual(hash, stored.hash);
};

const formatDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris'
    });
  } catch { return String(iso); }
};

const formatDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris'
    });
  } catch { return String(iso); }
};

module.exports = {
  esc, slugify, safeJoin, readJson, writeJson,
  randomToken, sign, safeEqual, hashPassword, verifyPassword,
  formatDate, formatDateTime
};
