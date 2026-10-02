/* msh — the tiny shell that powers the portfolio. Commands are registered by modules, see core/portfolio.js. */
(function () {
  'use strict';

  const { esc, store, meter, htmlToText, levenshtein } = Portfolio.util;

  class Interrupt extends Error {
    constructor() { super('interrupted'); this.name = 'Interrupt'; }
  }

  class Terminal {
    constructor({ screen, output, vfs }) {
      this.screen = screen;
      this.output = output;
      this.vfs = vfs;
      this.commands = new Map();
      this.aliases = {};
      this.listeners = {};
      this.history = store.get('history', []);
      this.hIndex = this.history.length;
      this.draft = '';
      this.env = {
        USER: 'guest', HOME: Portfolio.VFS.HOME, SHELL: '/bin/msh', TERM: 'xterm-256color',
        HOSTNAME: `${Portfolio.cv.handle}-portfolio`, LANG: 'en_US.UTF-8', EDITOR: 'vim', COFFEE: 'required'
      };
      this.cwd = this.env.HOME;
      this.prevCwd = this.cwd;
      this.busy = false;
      this.interrupted = false;
      this.program = null;   // { onKey(e) } while a full-screen program owns the keyboard
      this.reader = null;    // input element while readLine() is waiting
      this.capture = null;   // array while a pipeline is capturing output
      this.input = null;
      this.ghost = null;
      this.inputLine = null;
      this.suggestion = '';
      this.typeahead = '';   // keys typed while a command was running, replayed into the next prompt
      this.bindGlobalKeys();
    }

    /* ── events ─────────────────────────────────────────── */
    on(name, fn) { (this.listeners[name] ||= []).push(fn); }
    emit(name, ...args) { for (const fn of this.listeners[name] || []) fn(...args); }

    /* ── helpers available to every command as t.<name> ─ */
    get cv() { return Portfolio.cv; }
    get config() { return Portfolio.config; }
    get fx() { return Portfolio.fx; }
    get esc() { return esc; }
    get meter() { return meter; }
    get store() { return store; }
    unlock(id) { Portfolio.achievements.unlock(id); }

    /** Reads a file for a command, printing the usual error and returning null when it cannot. */
    readFile(path, cmdName) {
      if (!path) { this.printText(`${cmdName}: missing file operand (or pipe something in: cat about.txt | ${cmdName})`, 'err'); return null; }
      const { node, denied } = this.vfs.resolve(path, this.cwd);
      if (denied || (node && node.locked)) { this.printText(`${cmdName}: ${path}: Permission denied`, 'err'); return null; }
      if (!node) { this.printText(`${cmdName}: ${path}: No such file or directory`, 'err'); return null; }
      if (node.type === 'dir') { this.printText(`${cmdName}: ${path}: Is a directory`, 'err'); return null; }
      return this.vfs.read(node);
    }

    /* ── registry ───────────────────────────────────────── */
    register(def) {
      this.commands.set(def.name, { group: 'Fun', desc: '', usage: def.name, ...def });
      for (const a of def.aliases || []) this.alias(a, def.name);
    }
    alias(name, expansion) { this.aliases[name] = expansion; }
    isCommand(name) { return this.commands.has(name) || name in this.aliases; }
    visibleCommands() { return [...this.commands.values()].filter(c => !c.hidden); }

    /* ── output ─────────────────────────────────────────── */
    print(html = '', cls = '') {
      if (this.capture) {
        this.capture.push(...htmlToText(html).split('\n'));
        return null;
      }
      const line = document.createElement('div');
      line.className = 'line' + (cls ? ' ' + cls : '');
      line.innerHTML = html;
      if (this.inputLine && this.inputLine.isConnected) this.output.insertBefore(line, this.inputLine);
      else this.output.appendChild(line);
      this.scroll();
      return line;
    }
    printText(text = '', cls = '') { return this.print(esc(text), cls); }
    blank() { return this.print(''); }
    clear() { this.output.innerHTML = ''; }
    scroll() { this.screen.scrollTop = this.screen.scrollHeight; }

    cmd(command, label = command) {
      return `<a class="cmd" href="#" data-cmd="${esc(command)}">${esc(label)}</a>`;
    }
    link(url, label = url) {
      return `<a class="ext" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)}</a>`;
    }

    sleep(ms) {
      return new Promise((resolve, reject) => {
        if (this.interrupted) { reject(new Interrupt()); return; }
        const started = performance.now();
        const tick = () => {
          if (this.interrupted) { reject(new Interrupt()); return; }
          if (performance.now() - started >= ms) resolve();
          else setTimeout(tick, Math.min(30, ms));
        };
        setTimeout(tick, Math.min(30, ms));
      });
    }

    async type(text, cls = '', delay = 18) {
      const line = this.print('', cls);
      if (!line) return;
      for (const ch of text) {
        line.textContent += ch;
        this.scroll();
        await this.sleep(delay);
      }
    }

    async progress(label, ms = 900, width = 24) {
      const line = this.print('');
      if (!line) return;
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const filled = Math.round((i / steps) * width);
        line.innerHTML = `${esc(label.padEnd(30))} ${meter((filled / width) * 100, width)} ${String(Math.round((i / steps) * 100)).padStart(3)}%`;
        await this.sleep(ms / steps);
      }
    }

    /** Prompts for a line of input (used by sudo). Resolves with the text. */
    readLine(label, { mask = false } = {}) {
      return new Promise((resolve, reject) => {
        const line = this.print(`<span>${esc(label)}</span>`, 'prompt-line');
        const input = document.createElement('input');
        input.type = mask ? 'password' : 'text';
        input.className = 'reader';
        input.autocomplete = 'off';
        input.setAttribute('aria-label', label);
        const wrap = document.createElement('span');
        wrap.className = 'input-wrap';
        const cursor = document.createElement('span');
        cursor.className = 'cursor';
        cursor.textContent = '\u00a0';
        wrap.append(input, cursor);
        line.appendChild(wrap);
        this.reader = input;
        input.focus();
        input.addEventListener('keydown', e => {
          if (e.key === 'Enter') {
            e.preventDefault();
            this.reader = null;
            input.disabled = true;
            cursor.remove();
            resolve(input.value);
          } else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.reader = null;
            input.disabled = true;
            cursor.remove();
            reject(new Interrupt());
          }
        });
      });
    }

    /* ── prompt ─────────────────────────────────────────── */
    promptHTML() {
      const path = Portfolio.VFS.prettyPath(this.cwd);
      return `<span class="p-user">${esc(this.env.USER)}@${esc(Portfolio.cv.handle)}</span><span class="p-sep">:</span><span class="p-path">${esc(path)}</span><span class="p-sym">$ </span>`;
    }

    newPrompt(value = '') {
      value += this.typeahead;
      this.typeahead = '';
      const line = document.createElement('div');
      line.className = 'line prompt-line';
      line.innerHTML = this.promptHTML();
      const wrap = document.createElement('span');
      wrap.className = 'input-wrap';
      const ghost = document.createElement('span');
      ghost.className = 'ghost';
      ghost.setAttribute('aria-hidden', 'true');
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'cmdline';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('autocapitalize', 'off');
      input.setAttribute('autocorrect', 'off');
      input.setAttribute('enterkeyhint', 'send');
      input.setAttribute('aria-label', 'Terminal command input');
      input.value = value;
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      cursor.setAttribute('aria-hidden', 'true');
      wrap.append(ghost, input, cursor);
      line.appendChild(wrap);
      this.output.appendChild(line);
      input.addEventListener('keydown', e => { this.onInputKey(e); requestAnimationFrame(() => this.decorate()); });
      input.addEventListener('input', () => this.decorate());
      input.addEventListener('scroll', () => this.decorate());
      for (const ev of ['keyup', 'click', 'mouseup', 'select', 'focus']) input.addEventListener(ev, () => this.decorate());
      this.input = input;
      this.ghost = ghost;
      this.cursor = cursor;
      this.inputLine = line;
      this.decorate();
      this.focus();
      this.scroll();
      document.getElementById('title').textContent = `${this.env.USER}@${Portfolio.cv.handle}: ${Portfolio.VFS.prettyPath(this.cwd)}`;
    }

    focus() {
      if (this.reader) { this.reader.focus({ preventScroll: true }); return; }
      if (this.input && !this.busy) this.input.focus({ preventScroll: true });
    }

    /** fish-style syntax highlighting for the command line. */
    highlight(value) {
      let expectCmd = true;
      return value.split(/(\s+|\|\||&&|\||;)/).map(tok => {
        if (!tok) return '';
        if (/^\s+$/.test(tok)) return tok;
        if (['|', '&&', ';', '||'].includes(tok)) { expectCmd = true; return `<span class="hl-op">${esc(tok)}</span>`; }
        if (expectCmd) {
          expectCmd = false;
          const name = tok.startsWith('./') ? null : tok;
          let ok = name ? this.isCommand(name) : false;
          if (!name) {
            const { node } = this.vfs.resolve(tok, this.cwd);
            ok = Boolean(node && node.exec);
          }
          return `<span class="${ok ? 'hl-cmd' : 'hl-bad'}">${esc(tok)}</span>`;
        }
        if (tok.startsWith('-')) return `<span class="hl-flag">${esc(tok)}</span>`;
        if (/^["']/.test(tok)) return `<span class="hl-str">${esc(tok)}</span>`;
        if (tok.startsWith('$')) return `<span class="hl-var">${esc(tok)}</span>`;
        const { node } = this.vfs.resolve(tok, this.cwd);
        return node ? `<span class="hl-path">${esc(tok)}</span>` : esc(tok);
      }).join('');
    }

    decorate() {
      if (!this.input) return;
      const v = this.input.value;
      const atEnd = this.input.selectionStart === v.length;
      this.suggestion = '';
      if (v && atEnd) {
        for (let i = this.history.length - 1; i >= 0; i--) {
          if (this.history[i].startsWith(v) && this.history[i] !== v) { this.suggestion = this.history[i].slice(v.length); break; }
        }
        if (!this.suggestion && !/\s/.test(v)) {
          const matches = this.visibleCommands().map(c => c.name).filter(n => n.startsWith(v) && n !== v).sort();
          if (matches.length) this.suggestion = matches[0].slice(v.length);
        }
      }
      this.ghost.innerHTML = this.highlight(v) + `<span class="suggest">${esc(this.suggestion)}</span>`;
      this.ghost.scrollLeft = this.input.scrollLeft;
      this.placeCursor();
    }

    /** Draws the block cursor over the caret, showing the character under it inverted. */
    placeCursor() {
      const { input, cursor } = this;
      if (!input || !cursor) return;
      const pos = input.selectionStart ?? input.value.length;
      const under = input.value[pos] ?? this.suggestion[0] ?? ' ';
      cursor.textContent = under === ' ' ? '\u00a0' : under;
      cursor.style.left = `calc(${pos}ch - ${input.scrollLeft}px)`;
      cursor.hidden = input.selectionStart !== input.selectionEnd;
      // stay solid while typing, resume blinking when idle
      cursor.classList.add('typing');
      clearTimeout(this.blinkTimer);
      this.blinkTimer = setTimeout(() => cursor.classList.remove('typing'), 600);
    }

    freezePrompt(value) {
      if (!this.inputLine) return;
      const wrap = this.inputLine.querySelector('.input-wrap');
      const span = document.createElement('span');
      span.innerHTML = this.highlight(value);
      wrap.replaceWith(span);
      this.input = null;
      this.ghost = null;
      this.cursor = null;
      this.inputLine = null;
    }

    /* ── keyboard ───────────────────────────────────────── */
    bindGlobalKeys() {
      document.addEventListener('keydown', e => {
        if (document.getElementById('gui') && !document.getElementById('gui').hidden) return;
        if (this.program) { this.program.onKey(e); return; }
        if (this.busy && !this.reader) {
          if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) { e.preventDefault(); this.interrupted = true; this.typeahead = ''; }
          else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) this.typeahead += e.key;
          else if (e.key === 'Backspace') this.typeahead = this.typeahead.slice(0, -1);
          return;
        }
        if (e.ctrlKey || e.metaKey || e.altKey) return;
        const target = this.reader || this.input;
        if (target && document.activeElement !== target) target.focus({ preventScroll: true });
      });

      this.screen.addEventListener('click', e => {
        const a = e.target.closest('a.cmd');
        if (a) {
          e.preventDefault();
          this.runFromUI(a.dataset.cmd);
          return;
        }
        if (window.getSelection().toString()) return;
        this.focus();
      });
    }

    async runFromUI(command) {
      if (this.busy || !this.input) return;
      this.input.value = '';
      for (const ch of command) {
        this.input.value += ch;
        this.decorate();
        await new Promise(r => setTimeout(r, 12));
      }
      this.submit(this.input.value);
    }

    onInputKey(e) {
      const input = this.input;
      if (e.key === 'Enter') {
        e.preventDefault();
        this.submit(input.value);
      } else if (e.key === 'Tab') {
        e.preventDefault();
        this.complete();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (this.hIndex === this.history.length) this.draft = input.value;
        if (this.hIndex > 0) this.hIndex--;
        input.value = this.history[this.hIndex] ?? this.draft;
        this.decorate();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (this.hIndex < this.history.length) this.hIndex++;
        input.value = this.hIndex === this.history.length ? this.draft : this.history[this.hIndex];
        this.decorate();
      } else if ((e.key === 'ArrowRight' || e.key === 'End') && this.suggestion && input.selectionStart === input.value.length) {
        e.preventDefault();
        input.value += this.suggestion;
        this.decorate();
      } else if (e.ctrlKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        const v = input.value;
        this.clear();
        this.newPrompt(v);
      } else if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        if (window.getSelection().toString()) return;
        e.preventDefault();
        this.freezePrompt(input.value);
        this.output.lastElementChild.insertAdjacentHTML('beforeend', '<span class="dim">^C</span>');
        this.newPrompt();
      } else if (e.ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        input.value = '';
        this.decorate();
      }
    }

    complete() {
      const input = this.input;
      const caret = input.selectionStart;
      const before = input.value.slice(0, caret);
      const word = before.match(/(\S*)$/)[1];
      const start = caret - word.length;
      const head = before.slice(0, start);
      const cmdPos = /^\s*$/.test(head) || /(\||&&|;)\s*$/.test(head);
      let candidates = [];

      if (cmdPos && !word.includes('/')) {
        candidates = [...this.visibleCommands().map(c => c.name), ...Object.keys(this.aliases)]
          .filter(n => n.startsWith(word));
      } else {
        const slash = word.lastIndexOf('/');
        const dirPart = slash >= 0 ? word.slice(0, slash + 1) : '';
        const base = word.slice(slash + 1);
        const { node } = this.vfs.resolve(dirPart || '.', this.cwd);
        if (node && node.type === 'dir' && !node.locked) {
          candidates = Object.entries(node.children)
            .filter(([n]) => n.startsWith(base) && (base.startsWith('.') || !n.startsWith('.')))
            .map(([n, child]) => dirPart + n + (child.type === 'dir' ? '/' : ''));
        }
        const cmdName = head.trim().split(/\s+/).pop();
        const def = this.commands.get(head.trim().split(/\s+/)[0]) || this.commands.get(cmdName);
        if (def && Array.isArray(def.complete)) candidates.push(...def.complete.filter(c => c.startsWith(word)));
        if (def && typeof def.complete === 'function') candidates.push(...def.complete().filter(c => c.startsWith(word)));
      }
      candidates = [...new Set(candidates)].sort();
      if (!candidates.length) return;

      let replacement;
      if (candidates.length === 1) {
        replacement = candidates[0] + (candidates[0].endsWith('/') ? '' : ' ');
      } else {
        let prefix = candidates[0];
        for (const c of candidates) while (!c.startsWith(prefix)) prefix = prefix.slice(0, -1);
        if (prefix.length > word.length) replacement = prefix;
        else {
          const label = c => c.endsWith('/') ? `<span class="dir">${esc(c)}</span>` : esc(c);
          this.print(candidates.map(label).join('  '), 'completions');
          return;
        }
      }
      input.value = input.value.slice(0, start) + replacement + input.value.slice(caret);
      const pos = start + replacement.length;
      input.setSelectionRange(pos, pos);
      this.decorate();
    }

    /* ── execution ──────────────────────────────────────── */
    async submit(raw) {
      this.freezePrompt(raw);
      const line = raw.trim();
      if (line) {
        if (this.history[this.history.length - 1] !== line) this.history.push(line);
        this.history = this.history.slice(-300);
        store.set('history', this.history);
      }
      this.hIndex = this.history.length;
      this.draft = '';
      if (line) {
        this.busy = true;
        this.interrupted = false;
        try {
          await this.execLine(line);
        } catch (err) {
          this.capture = null;
          if (err instanceof Interrupt) this.print('<span class="dim">^C</span>');
          else {
            this.printText(`msh: ${err.message}`, 'err');
            console.error('msh: command failed', err);
          }
        } finally {
          this.busy = false;
          this.program = null;
          this.reader = null;
          this.interrupted = false;
        }
        this.emit('command', line);
      }
      this.newPrompt();
    }

    tokenize(line) {
      const toks = [];
      let cur = '', quote = null, has = false;
      const flush = () => { if (has || cur) toks.push({ word: cur }); cur = ''; has = false; };
      for (let i = 0; i < line.length; i++) {
        const c = line[i];
        if (quote) {
          if (c === quote) quote = null;
          else if (c === '$' && quote === '"') { const m = line.slice(i + 1).match(/^[A-Za-z_]\w*/); if (m) { cur += this.env[m[0]] ?? ''; i += m[0].length; } else cur += c; }
          else cur += c;
          continue;
        }
        if (c === '"' || c === "'") { quote = c; has = true; continue; }
        if (/\s/.test(c)) { flush(); continue; }
        if (c === '&' && line[i + 1] === '&') { flush(); toks.push({ op: '&&' }); i++; continue; }
        if (c === '|' && line[i + 1] === '|') { flush(); toks.push({ op: '||' }); i++; continue; }
        if (c === ';' || c === '|') { flush(); toks.push({ op: c }); continue; }
        if (c === '$') {
          const m = line.slice(i + 1).match(/^[A-Za-z_]\w*|^\?/);
          if (m) { cur += m[0] === '?' ? String(this.lastStatus ?? 0) : (this.env[m[0]] ?? ''); i += m[0].length; has = true; continue; }
        }
        cur += c;
      }
      if (quote) throw new Error(`unexpected EOF while looking for matching \`${quote}'`);
      flush();
      return toks;
    }

    parse(line) {
      const chain = [];
      let step = { op: null, stages: [[]] };
      for (const t of this.tokenize(line)) {
        if (t.op === '|') step.stages.push([]);
        else if (t.op) { chain.push(step); step = { op: t.op, stages: [[]] }; }
        else step.stages[step.stages.length - 1].push(t.word);
      }
      chain.push(step);
      return chain.filter(s => s.stages.some(st => st.length));
    }

    async execLine(line) {
      let status = 0;
      for (const step of this.parse(line)) {
        if (step.op === '&&' && status !== 0) continue;
        if (step.op === '||' && status === 0) continue;
        status = await this.runPipeline(step.stages);
        this.lastStatus = status;
      }
      return status;
    }

    async runPipeline(stages) {
      if (stages.some(s => !s.length)) throw new Error('syntax error near unexpected token `|\'');
      if (stages.length === 1) return this.run(stages[0]);

      this.capture = [];
      let status;
      let text = '';
      try { status = await this.run(stages[0]); }
      finally { text = (this.capture || []).join('\n'); this.capture = null; }

      for (let i = 1; i < stages.length; i++) {
        const [name, ...args] = this.expandAlias(stages[i]);
        const def = this.commands.get(name);
        if (!def) { this.notFound(name); return 127; }
        if (!def.filter) { this.printText(`msh: ${name}: cannot read from a pipe (try it without |)`, 'err'); return 1; }
        const result = def.filter(text, args, this);
        const isLast = i === stages.length - 1;
        if (isLast) {
          if (result && typeof result === 'object') this.print(result.html);
          else if (result) this.printText(result);
        } else {
          text = result && typeof result === 'object' ? result.text : (result ?? '');
        }
      }
      return status;
    }

    expandAlias(words) {
      const [name, ...rest] = words;
      if (this.aliases[name]) return [...this.aliases[name].split(/\s+/), ...rest];
      return words;
    }

    async run(words) {
      const [name, ...args] = this.expandAlias(words);
      if (name.includes('/')) {
        const { node, path } = this.vfs.resolve(name, this.cwd);
        if (node && node.exec) return this.run([node.exec, ...args]);
        if (node && node.type === 'dir') { this.printText(`msh: ${name}: is a directory`, 'err'); return 126; }
        if (node) { this.printText(`msh: permission denied: ${name}`, 'err'); return 126; }
        this.printText(`msh: no such file or directory: ${path}`, 'err');
        return 127;
      }
      const def = this.commands.get(name);
      if (!def) { this.notFound(name); return 127; }
      this.emit('run', name, args);
      const result = await def.run(args, this, name);
      return typeof result === 'number' ? result : 0;
    }

    notFound(name) {
      this.emit('notfound', name);
      const { node } = this.vfs.resolve(name, this.cwd);
      if (node && node.type === 'file') {
        this.print(`msh: permission denied: ${esc(name)} — did you mean ${this.cmd('cat ' + name)}?`, 'err');
        return;
      }
      const near = [...this.visibleCommands().map(c => c.name), ...Object.keys(this.aliases)]
        .map(n => [n, levenshtein(name, n)])
        .filter(([, d]) => d <= 2)
        .sort((a, b) => a[1] - b[1])
        .slice(0, 3)
        .map(([n]) => this.cmd(n));
      this.print(`msh: command not found: <span class="bad">${esc(name)}</span>` + (near.length ? ` — did you mean ${near.join(', ')}?` : ` — type ${this.cmd('help')} for a list of commands`));
    }
  }

  Portfolio.Terminal = Terminal;
  Portfolio.Interrupt = Interrupt;
})();
