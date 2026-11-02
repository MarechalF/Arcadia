'use strict';

const { esc } = require('./utils');

function sanitizeHtml(html) {
  return html
    .replace(/<\s*script[\s\S]*?<\s*\/\s*script\s*>/gi, '')
    .replace(/<\s*iframe[\s\S]*?<\s*\/\s*iframe\s*>/gi, '')
    .replace(/<\s*(object|embed|form|link|meta|base)[^>]*>/gi, '')
    .replace(/\son\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/\son\w+\s*=\s*'[^']*'/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]+/gi, '')
    .replace(/(href|src)\s*=\s*"\s*javascript:[^"]*"/gi, '$1="#"')
    .replace(/(href|src)\s*=\s*'\s*javascript:[^']*'/gi, "$1='#'");
}

function inline(text) {
  let out = esc(text);
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, (m, alt, url) => {
    if (/^javascript:/i.test(url)) return esc(alt);
    return `<img src="${esc(url)}" alt="${esc(alt)}" loading="lazy">`;
  });
  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, url) => {
    if (/^javascript:/i.test(url)) return esc(label);
    return `<a href="${esc(url)}">${label}</a>`;
  });
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  out = out.replace(/~~([^~]+)~~/g, '<del>$1</del>');
  return out;
}

function renderMarkdown(src) {
  const lines = String(src).replace(/\r\n/g, '\n').split('\n');
  const html = [];
  let i = 0;
  let inCode = false;
  let codeBuf = [];
  let list = null;
  let para = [];

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${para.map(inline).join('<br>')}</p>`);
      para = [];
    }
  };
  const flushList = () => {
    if (list) {
      html.push(`<${list.tag}>${list.items.map(it => `<li>${inline(it)}</li>`).join('')}</${list.tag}>`);
      list = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCode) {
        html.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);
        codeBuf = []; inCode = false;
      } else {
        flushPara(); flushList();
        inCode = true;
      }
      i++; continue;
    }
    if (inCode) { codeBuf.push(line); i++; continue; }

    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      flushPara(); flushList();
      const level = h[1].length;
      html.push(`<h${level}>${inline(h[2].trim())}</h${level}>`);
      i++; continue;
    }

    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ul || ol) {
      flushPara();
      const tag = ul ? 'ul' : 'ol';
      const item = (ul || ol)[1];
      if (!list || list.tag !== tag) { flushList(); list = { tag, items: [] }; }
      list.items.push(item.trim());
      i++; continue;
    }

    if (/^\s*>\s?/.test(line)) {
      flushPara(); flushList();
      const quote = [];
      while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${renderMarkdown(quote.join('\n'))}</blockquote>`);
      continue;
    }

    if (/^\s*---+\s*$/.test(line)) {
      flushPara(); flushList();
      html.push('<hr>');
      i++; continue;
    }

    if (line.trim() === '') {
      flushPara(); flushList();
      i++; continue;
    }

    para.push(line.trim());
    i++;
  }
  flushPara(); flushList();
  if (inCode) html.push(`<pre><code>${esc(codeBuf.join('\n'))}</code></pre>`);

  return sanitizeHtml(html.join('\n'));
}

function parseFrontMatter(raw) {
  const m = String(raw).match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: String(raw) };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
    if (!kv) continue;
    let v = kv[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (v.startsWith('[') && v.endsWith(']')) {
      v = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    }
    meta[kv[1]] = v;
  }
  return { meta, body: m[2] };
}

module.exports = { renderMarkdown, parseFrontMatter, sanitizeHtml, inline };
