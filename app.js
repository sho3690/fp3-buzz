(() => {
  'use strict';

  const FIELDS = window.FP3_FIELDS || {};
  const ALL_QS = window.FP3_RUSH_QUESTIONS || [];
  const DIAGRAMS = window.FP3_DIAGRAMS || [];
  const BASE_EPISODES = window.FP3_LIVE_EPISODES || [];
  const STORE_KEY = 'fp3buzz.v1';

  const RANKS = [
    { min: 0, title: '見習いアカウント', badge: '' },
    { min: 300, title: 'FP発信者', badge: '' },
    { min: 1000, title: '認証FPアカウント', badge: 'blue' },
    { min: 5000, title: '万バズFP講師', badge: 'blue' },
    { min: 15000, title: 'FP3級インフルエンサー', badge: 'gold' },
    { min: 50000, title: '合格請負人', badge: 'gold' }
  ];

  const TRENDS = [
    { cat: 'タックス・トレンド', word: '#富士山上（損益通算）', key: 'tax' },
    { cat: '金融・トレンド', word: '#新NISA年360万', key: 'fin' },
    { cat: '相続・トレンド', word: '#3000万プラス600万', key: 'inh' },
    { cat: '不動産・トレンド', word: '#公信力はない', key: 're' },
    { cat: 'リスク・トレンド', word: '#生保90損保80', key: 'risk' },
    { cat: 'ライフ・トレンド', word: '#繰下げ0.7パーセント', key: 'life' }
  ];

  const $ = s => document.querySelector(s);
  const $$ = s => document.querySelectorAll(s);
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k.startsWith('on')) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    }
    for (const k of kids) if (k != null) n.append(k);
    return n;
  };

  const shuffle = arr => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const fmtNum = n => {
    if (n >= 10000) return (n / 10000).toFixed(1).replace(/\.0$/, '') + '万';
    return n.toLocaleString('ja-JP');
  };

  const todayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  /* ---------- 永続データ ---------- */
  const freshState = () => ({
    followers: 12,
    impressions: 120,
    streak: 1,
    lastDay: todayStr(),
    rushBest: 0,
    sound: true,
    weakIds: [],
    fieldStats: {}
  });

  let state = freshState();
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) state = Object.assign(freshState(), JSON.parse(raw));
  } catch (_) {}

  const save = () => {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  };

  let activeView = 'live';
  let activeField = 'all';
  let combo = 0;

  /* ---------- サウンド & 音声合成 & 紙吹雪 ---------- */
  let audioCtx = null;
  const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5, 1174.66, 1318.51];

  const tone = (freq, dur, type = 'triangle', delay = 0, vol = 0.1) => {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const t = audioCtx.currentTime + delay;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    } catch (_) {}
  };

  const sfxOk = c => {
    const f = PENTA[Math.min(c - 1, PENTA.length - 1)];
    tone(f, 0.1, 'triangle', 0, 0.12);
    tone(f * 1.5, 0.18, 'sine', 0.05, 0.09);
  };
  const sfxNg = () => {
    tone(160, 0.14, 'sawtooth', 0, 0.07);
    tone(120, 0.2, 'sine', 0.07, 0.1);
  };
  const sfxBuzz = () => [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'triangle', i * 0.06, 0.1));

  // Web Speech API (受動視聴用の軽快な読み上げ)
  const synth = 'speechSynthesis' in window ? window.speechSynthesis : null;
  const speakShort = text => {
    if (!state.sound || !synth) return;
    try {
      synth.cancel();
      const u = new SpeechSynthesisUtterance(text.replace(/[【】「」🦆⚡]/g, ''));
      u.lang = 'ja-JP';
      u.rate = 1.35;
      synth.speak(u);
    } catch (_) {}
  };

  const canvas = $('#fx-canvas');
  const ctx = canvas.getContext('2d');
  let parts = [];
  let raf = 0;
  const FX_COLORS = ['#1d9bf0', '#00ba7c', '#ffd400', '#f91880', '#ffffff'];

  const confetti = (count, x, y) => {
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(window.innerWidth * dpr)) {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let i = 0; i < count; i++) {
      parts.push({
        x, y,
        vx: (Math.random() - 0.5) * 14,
        vy: -Math.random() * 10 - 3,
        s: 4 + Math.random() * 5,
        r: Math.random() * 6.28,
        vr: (Math.random() - 0.5) * 0.35,
        life: 50 + Math.floor(Math.random() * 25),
        c: FX_COLORS[i % FX_COLORS.length]
      });
    }
    if (!raf) raf = requestAnimationFrame(tickFx);
  };

  const tickFx = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    parts = parts.filter(p => p.life > 0 && p.y < window.innerHeight + 30);
    for (const p of parts) {
      p.vy += 0.42;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      p.life--;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.globalAlpha = Math.min(1, p.life / 20);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.66);
      ctx.restore();
    }
    raf = parts.length ? requestAnimationFrame(tickFx) : 0;
  };

  let toastTimer = 0;
  const pushNotify = msg => {
    const t = $('#push-toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  };

  /* ---------- 共通スコア処理 ---------- */
  const getRank = followers => {
    let current = RANKS[0];
    for (const r of RANKS) if (followers >= r.min) current = r;
    return current;
  };

  const recordAnswer = (q, isCorrect, fxOrigin) => {
    const fs = state.fieldStats[q.f] || (state.fieldStats[q.f] = { n: 0, c: 0 });
    fs.n++;

    const today = todayStr();
    if (state.lastDay !== today) {
      state.streak++;
      state.lastDay = today;
    }

    if (isCorrect) {
      fs.c++;
      combo++;
      const mult = combo >= 10 ? 4 : combo >= 5 ? 2.5 : combo >= 3 ? 1.5 : 1;
      const gainFollowers = Math.round((25 + Math.random() * 20) * mult);
      const gainImp = Math.round((40 + Math.random() * 50) * mult);

      const prevRank = getRank(state.followers).title;
      state.followers += gainFollowers;
      state.impressions += gainImp;
      const nextRank = getRank(state.followers).title;

      const wi = state.weakIds.indexOf(q.id);
      if (wi >= 0) state.weakIds.splice(wi, 1);

      sfxOk(combo);
      if (fxOrigin) confetti(combo >= 5 ? 35 : 14, fxOrigin.x, fxOrigin.y);

      if (nextRank !== prevRank) {
        sfxBuzz();
        pushNotify(`🎉 ランクアップ！「${nextRank}」になりました`);
      } else if (combo === 5) {
        sfxBuzz();
        pushNotify(`🔥 5連続正解！あなたの解説がバズっています (+${gainFollowers}フォロワー)`);
      }
      save();
      renderAllStats();
      return { gainFollowers, gainImp };
    } else {
      combo = 0;
      if (!state.weakIds.includes(q.id)) state.weakIds.push(q.id);
      sfxNg();
      save();
      renderAllStats();
      return { gainFollowers: 0, gainImp: 0 };
    }
  };

  /* ---------- UIレンダリング ---------- */
  const renderAllStats = () => {
    const rank = getRank(state.followers);
    $('#my-rank-name').textContent = rank.title;
    const badge = $('#my-badge');
    if (rank.badge) {
      badge.hidden = false;
      badge.className = rank.badge === 'gold' ? 'badge-blue badge-gold' : 'badge-blue';
    } else {
      badge.hidden = true;
    }

    $('#stat-followers').textContent = fmtNum(state.followers);
    $('#stat-imp').textContent = fmtNum(state.impressions);
    $('#plinko-yen').textContent = state.impressions.toLocaleString('ja-JP');
    $('#stat-streak').textContent = state.streak;
    $('#m-followers').textContent = fmtNum(state.followers);
    if ($('#m-imp')) $('#m-imp').textContent = fmtNum(state.impressions);
    $('#m-combo').textContent = combo;
    $('#combo-pill').textContent = `🔥 ${combo} COMBO`;
    $('#btn-sound').textContent = state.sound ? '🔊 音・読み上げ ON' : '🔇 音・読み上げ OFF';
    $('#m-sound').textContent = state.sound ? '🔊' : '🔇';

    const wc = $('#weak-count');
    wc.textContent = state.weakIds.length;
    wc.hidden = state.weakIds.length === 0;

    const mList = $('#mastery-list');
    mList.textContent = '';
    Object.entries(FIELDS).forEach(([k, f]) => {
      const st = state.fieldStats[k] || { n: 0, c: 0 };
      const pct = st.n ? Math.round((st.c / st.n) * 100) : 0;
      mList.append(
        el('div', { class: 'mastery-row' },
          el('div', { class: 'mastery-top' },
            el('span', { text: `${f.icon} ${f.name}` }),
            el('span', { text: st.n ? `${pct}% (${st.c}/${st.n})` : '未挑戦' })
          ),
          el('div', { class: 'mastery-track' },
            el('div', { class: 'mastery-fill', style: `width:${pct}%; background:${f.color}` })
          )
        )
      );
    });
  };

  /* ---------- 下半分：常時稼働 物理ピンボール (Sludge / Plinko Engine) ---------- */
  const pCanvas = $('#plinko-canvas');
  const pCtx = pCanvas.getContext('2d');
  let pBalls = [];
  let pTexts = [];
  let pPegs = [];
  const BUCKETS = [
    { label: '×1', mult: 5, color: '#2f3336' },
    { label: '×3', mult: 15, color: '#1d9bf0' },
    { label: '💎×10', mult: 50, color: '#ffd400' },
    { label: '💎×10', mult: 50, color: '#f91880' },
    { label: '×3', mult: 15, color: '#1d9bf0' },
    { label: '×1', mult: 5, color: '#2f3336' }
  ];

  const dropPlinkoBalls = (count = 1, isGold = false) => {
    const w = pCanvas.clientWidth || 400;
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        pBalls.push({
          x: w / 2 + (Math.random() - 0.5) * 44,
          y: 12,
          vx: (Math.random() - 0.5) * 1.8,
          vy: 0.5,
          r: isGold ? 6.5 : 5.5,
          color: isGold ? '#ffd400' : '#00f2ea'
        });
      }, i * 110);
    }
  };

  pCanvas.addEventListener('click', e => {
    const r = pCanvas.getBoundingClientRect();
    pBalls.push({
      x: e.clientX - r.left,
      y: 10,
      vx: (Math.random() - 0.5) * 2,
      vy: 0.5,
      r: 6,
      color: '#ffd400'
    });
    tone(660, 0.05, 'sine', 0, 0.04);
  });

  const tickPlinko = () => {
    if (activeView === 'live') {
      const rect = pCanvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const w = rect.width || 400;
      const h = rect.height || 200;
      if (pCanvas.width !== Math.round(w * dpr) || pCanvas.height !== Math.round(h * dpr)) {
        pCanvas.width = Math.round(w * dpr);
        pCanvas.height = Math.round(h * dpr);
        // ピンの再配置
        pPegs = [];
        const rows = 4;
        const topY = 28;
        const botY = h - 36;
        for (let r = 0; r < rows; r++) {
          const cols = r % 2 === 0 ? 7 : 6;
          const y = topY + ((botY - topY) / (rows - 1)) * r;
          const span = w * 0.76;
          const startX = (w - span) / 2 + (r % 2 === 1 ? span / 12 : 0);
          for (let c = 0; c < cols; c++) {
            pPegs.push({ x: startX + (span / 6) * c, y, glow: 0 });
          }
        }
      }

      pCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pCtx.clearRect(0, 0, w, h);

      // バケット描画
      const bw = w / BUCKETS.length;
      BUCKETS.forEach((b, idx) => {
        const bx = idx * bw;
        pCtx.fillStyle = b.color;
        pCtx.globalAlpha = 0.22;
        pCtx.fillRect(bx + 3, h - 24, bw - 6, 20);
        pCtx.globalAlpha = 1;
        pCtx.fillStyle = '#e7e9ea';
        pCtx.font = 'bold 11px sans-serif';
        pCtx.textAlign = 'center';
        pCtx.fillText(b.label, bx + bw / 2, h - 10);
      });

      // ピン描画
      for (const peg of pPegs) {
        if (peg.glow > 0) peg.glow -= 0.08;
        pCtx.beginPath();
        pCtx.arc(peg.x, peg.y, 3.5 + peg.glow * 3, 0, Math.PI * 2);
        pCtx.fillStyle = peg.glow > 0 ? '#ffd400' : '#4b5563';
        pCtx.fill();
      }

      // ボール物理更新
      const nextBalls = [];
      for (const b of pBalls) {
        b.vy += 0.24;
        b.x += b.vx;
        b.y += b.vy;

        if (b.x < 12) { b.x = 12; b.vx = Math.abs(b.vx) * 0.7; }
        if (b.x > w - 12) { b.x = w - 12; b.vx = -Math.abs(b.vx) * 0.7; }

        for (const peg of pPegs) {
          const dx = b.x - peg.x;
          const dy = b.y - peg.y;
          const dist = Math.hypot(dx, dy);
          const minDist = b.r + 3.5;
          if (dist < minDist && dist > 0.001) {
            const nx = dx / dist;
            const ny = dy / dist;
            b.x = peg.x + nx * minDist;
            b.y = peg.y + ny * minDist;
            b.vx = nx * 2.1 + (Math.random() - 0.5) * 0.9;
            b.vy = -Math.abs(b.vy) * 0.55;
            peg.glow = 1;
            tone(440 + Math.random() * 240, 0.04, 'sine', 0, 0.025);
          }
        }

        if (b.y >= h - 24) {
          const bIdx = Math.min(BUCKETS.length - 1, Math.max(0, Math.floor(b.x / bw)));
          const bucket = BUCKETS[bIdx];
          state.impressions += bucket.mult;
          state.followers += Math.ceil(bucket.mult / 5);
          $('#plinko-yen').textContent = state.impressions.toLocaleString('ja-JP');
          $('#stat-imp').textContent = fmtNum(state.impressions);
          $('#stat-followers').textContent = fmtNum(state.followers);
          pTexts.push({ x: b.x, y: h - 26, text: `+${bucket.mult}万`, life: 32, color: bucket.mult >= 50 ? '#ffd400' : '#00ba7c' });
          tone(bucket.mult >= 50 ? 1046.5 : 784, 0.09, 'triangle', 0, 0.05);
        } else {
          nextBalls.push(b);
        }
      }
      pBalls = nextBalls;

      for (const b of pBalls) {
        pCtx.beginPath();
        pCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        pCtx.fillStyle = b.color;
        pCtx.fill();
      }

      pTexts = pTexts.filter(t => t.life > 0);
      for (const t of pTexts) {
        t.y -= 0.7;
        t.life--;
        pCtx.globalAlpha = Math.min(1, t.life / 15);
        pCtx.fillStyle = t.color;
        pCtx.font = 'bold 12px sans-serif';
        pCtx.textAlign = 'center';
        pCtx.fillText(t.text, t.x, t.y);
        pCtx.globalAlpha = 1;
      }
    }
    requestAnimationFrame(tickPlinko);
  };
  requestAnimationFrame(tickPlinko);

  // 放置していても4.5秒ごとに環境ボールが1個落ちて目を惹きつける
  setInterval(() => {
    if (activeView === 'live' && !livePaused && pBalls.length < 12) {
      dropPlinkoBalls(1, false);
    }
  }, 4500);

  /* ---------- 0. ライブ劇場（受動×論破 オートストーリーエンジン） ---------- */
  let liveQueue = [];
  let livePaused = false;
  let liveToken = { dead: false };

  // 全60問をライブ劇場エピソードとしても変換して統合
  const buildAllEpisodes = () => {
    const customIds = new Set(BASE_EPISODES.map(e => e.id));
    const autoEps = ALL_QS.filter(q => !customIds.has(q.id)).map(q => {
      const f = FIELDS[q.f];
      const isOx = q.t === 'ox';
      const optA = isOx ? (q.a ? '○ 正しい（ホント）' : '✕ 誤り（ウソ）') : q.c[0];
      const optB = isOx ? (q.a ? '✕ 誤り（ウソ）' : '○ 正しい（ホント）') : q.c[1];
      return {
        id: q.id,
        f: q.f,
        diagId: (DIAGRAMS.find(d => d.qIds.includes(q.id)) || {}).id || null,
        speaker: `🦆 迷える受検生 (${f.name})`,
        chat: `「${q.q}」`,
        optA,
        optB,
        correct: 'A',
        kinetic: ['結論行くよ！', `【 ${optA} 】`, q.point],
        summary: `${q.point}（${q.trap}）`,
        comments: ['ここテスト頻出！', 'なるほどね', '引っかかるところだったｗ']
      };
    });
    const all = [...BASE_EPISODES, ...autoEps];
    return activeField === 'all' ? shuffle(all) : shuffle(all.filter(e => e.f === activeField));
  };

  const waitMs = (ms, tk, onProgress) => new Promise(res => {
    let left = ms;
    let last = performance.now();
    const step = now => {
      if (tk.dead) return res(false);
      const dt = Math.min(100, now - last);
      last = now;
      if (!livePaused && activeView === 'live') left -= dt;
      if (onProgress) onProgress(Math.max(0, left) / ms, Math.max(0, left));
      if (left <= 0) return res(true);
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });

  const pushLiveComment = text => {
    const box = $('#live-comments');
    if (!box) return;
    const node = el('div', { class: 'live-cmt', text: `💬 ${text}` });
    box.append(node);
    while (box.children.length > 4) box.firstElementChild.remove();
    setTimeout(() => node.remove(), 2800);
  };

  const playNextEpisode = async () => {
    liveToken.dead = true;
    const tk = { dead: false };
    liveToken = tk;

    if (!liveQueue.length) liveQueue = buildAllEpisodes();
    const ep = liveQueue.shift();
    if (!ep) return;

    const f = FIELDS[ep.f];
    $('#live-cat-tag').textContent = `${f.icon} ${f.name}`;
    $('#live-cat-tag').style.background = f.color;
    $('#live-cat-tag').style.color = '#000';
    $('#live-viewers').textContent = (4100 + Math.floor(Math.random() * 900)).toLocaleString('ja-JP');

    // Step 1: 相談者のヤバい発言をポップ表示
    const bubble = $('#live-drama-bubble');
    bubble.style.animation = 'none';
    void bubble.offsetWidth;
    bubble.style.animation = '';
    $('#live-speaker').textContent = ep.speaker;
    $('#live-chat-text').textContent = ep.chat;

    $('#live-judge-box').hidden = true;
    $('#live-kinetic-box').hidden = true;

    tone(480, 0.07, 'sine', 0, 0.05);
    dropPlinkoBalls(1, false);
    pushLiveComment(ep.comments[0] || 'えっ！？');

    if (!(await waitMs(1700, tk))) return;

    // Step 2: 3.5秒の「論破チャンス（介入ウィンドウ）」！放置でもそのまま進む
    const judgeBox = $('#live-judge-box');
    judgeBox.hidden = false;
    const swap = Math.random() < 0.5;
    const textA = swap ? ep.optB : ep.optA;
    const textB = swap ? ep.optA : ep.optB;
    const correctSide = swap ? 'B' : 'A';

    const btnA = $('#live-opt-a');
    const btnB = $('#live-opt-b');
    btnA.textContent = textA;
    btnB.textContent = textB;
    btnA.disabled = false;
    btnB.disabled = false;

    let userChoice = null;
    const judgeTk = { dead: false };
    btnA.onclick = () => { userChoice = 'A'; judgeTk.dead = true; };
    btnB.onclick = () => { userChoice = 'B'; judgeTk.dead = true; };

    const barFill = $('#judge-bar-fill');
    const secLabel = $('#judge-sec');
    await waitMs(3800, {
      get dead() { return tk.dead || judgeTk.dead; }
    }, (frac, left) => {
      barFill.style.transform = `scaleX(${frac})`;
      secLabel.textContent = `${(left / 1000).toFixed(1)}s`;
    });
    if (tk.dead) return;

    judgeBox.hidden = true;
    const qObj = ALL_QS.find(q => q.id === ep.id) || { id: ep.id, f: ep.f };

    if (userChoice) {
      const ok = userChoice === correctSide;
      if (ok) {
        recordAnswer(qObj, true, { x: window.innerWidth / 2, y: window.innerHeight * 0.35 });
        dropPlinkoBalls(8, true);
        pushLiveComment('⚡ 論破キタ━━(ﾟ∀ﾟ)━━!!');
      } else {
        recordAnswer(qObj, false, null);
        pushLiveComment('あぶねぇ引っかかったｗ');
      }
    } else {
      // 100%受動視聴でも止めずに報酬ボールを2個落とす！
      dropPlinkoBalls(2, false);
      pushLiveComment(ep.comments[1] || '正解はどっちだ？');
    }

    // Step 3: キネティック字幕（1〜3語が巨大バウンス）＋ 図解アニメ
    const kBox = $('#live-kinetic-box');
    const kWord = $('#kinetic-word');
    const kSum = $('#kinetic-summary');
    const kDiag = $('#kinetic-diag');
    kBox.hidden = false;
    kSum.textContent = `💡 ${ep.summary}`;
    kDiag.innerHTML = '';

    if (ep.diagId) {
      const d = DIAGRAMS.find(x => x.id === ep.diagId);
      if (d) kDiag.innerHTML = d.svg;
    }

    for (let i = 0; i < ep.kinetic.length; i++) {
      const phrase = ep.kinetic[i];
      kWord.textContent = phrase;
      kWord.className = 'kinetic-word pop' + (phrase.includes('【') ? ' highlight' : '');
      tone(523.25 * Math.pow(1.12, i), 0.09, 'triangle', 0, 0.08);
      if (i === 1) speakShort(phrase + '。' + ep.summary);
      if (i === ep.kinetic.length - 1 && ep.comments[2]) pushLiveComment(ep.comments[2]);
      if (!(await waitMs(1150, tk))) return;
    }

    if (!(await waitMs(1800, tk))) return;
    playNextEpisode();
  };

  $('#btn-live-pause').addEventListener('click', () => {
    livePaused = !livePaused;
    $('#btn-live-pause').textContent = livePaused ? '▶ 再開' : '⏸ 一時停止';
  });

  $('#btn-live-skip').addEventListener('click', () => {
    playNextEpisode();
  });

  /* ---------- ジャンルフィルタ ---------- */
  const renderFieldChips = () => {
    const items = [['all', 'すべて'], ...Object.entries(FIELDS).map(([k, f]) => [k, f.name])];
    ['#field-chips', '#mobile-field-chips'].forEach(sel => {
      const wrap = $(sel);
      if (!wrap) return;
      wrap.textContent = '';
      items.forEach(([key, label]) => {
        wrap.append(
          el('button', {
            type: 'button',
            class: `f-chip ${activeField === key ? 'active' : ''}`,
            text: label,
            onclick: () => {
              activeField = key;
              renderFieldChips();
              liveQueue = buildAllEpisodes();
              if (activeView === 'live') playNextEpisode();
              if (activeView === 'swipe') initSwipeDeck();
              if (activeView === 'timeline') initTimeline();
            }
          })
        );
      });
    });
  };

  const renderTrends = () => {
    const list = $('#trend-list');
    list.textContent = '';
    TRENDS.forEach(tr => {
      const btn = el('button', {
        type: 'button',
        class: 'trend-item',
        style: 'display:block; width:100%; text-align:left;',
        onclick: () => {
          activeField = tr.key;
          renderFieldChips();
          liveQueue = buildAllEpisodes();
          if (activeView === 'live') playNextEpisode();
          else switchView('live');
        }
      },
        el('div', { class: 'trend-cat', text: tr.cat }),
        el('div', { class: 'trend-word', text: tr.word }),
        el('div', { class: 'trend-cnt', text: 'ライブ劇場でこの分野を流す →' })
      );
      list.append(btn);
    });
  };

  /* ---------- 1. スワイプ仕分けデッキ ---------- */
  let swipeQueue = [];
  let topCardEl = null;

  const getFilteredOx = () => {
    const base = ALL_QS.filter(q => q.t === 'ox');
    return activeField === 'all' ? base : base.filter(q => q.f === activeField);
  };

  const initSwipeDeck = () => {
    swipeQueue = shuffle(getFilteredOx());
    renderSwipeStack();
  };

  const createSwipeCardEl = (q, isBehind) => {
    const f = FIELDS[q.f];
    const card = el('div', { class: `swipe-card ${isBehind ? 'behind' : ''}` });
    const stampFact = el('div', { class: 'card-stamp stamp-fact', text: 'FACT ○' });
    const stampFake = el('div', { class: 'card-stamp stamp-fake', text: 'FAKE ✕' });

    card.append(
      stampFact,
      stampFake,
      el('div', { class: 'sc-top' },
        el('span', { class: 'sc-field', text: `${f.icon} ${f.name}`, style: `background:${f.color}` }),
        el('span', { class: 'sc-badge', text: q.badge })
      ),
      el('p', { class: 'sc-question', text: q.q }),
      el('div', { class: 'sc-footer' },
        el('span', { text: '← ウソ (✕)' }),
        el('span', { text: 'ホント (○) →' })
      )
    );

    if (!isBehind) {
      let startX = 0, dx = 0, dragging = false;

      card.addEventListener('pointerdown', e => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        dragging = true;
        startX = e.clientX;
        dx = 0;
        card.classList.add('dragging');
        card.setPointerCapture(e.pointerId);
      });

      card.addEventListener('pointermove', e => {
        if (!dragging) return;
        dx = e.clientX - startX;
        const rot = dx * 0.06;
        card.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
        const ratio = Math.min(1, Math.abs(dx) / 100);
        stampFact.style.opacity = dx > 15 ? String(ratio) : '0';
        stampFake.style.opacity = dx < -15 ? String(ratio) : '0';
      });

      const finishDrag = () => {
        if (!dragging) return;
        dragging = false;
        card.classList.remove('dragging');
        if (dx > 90) commitSwipe(true, card);
        else if (dx < -90) commitSwipe(false, card);
        else {
          card.style.transform = '';
          stampFact.style.opacity = '0';
          stampFake.style.opacity = '0';
        }
      };

      card.addEventListener('pointerup', finishDrag);
      card.addEventListener('pointercancel', finishDrag);
    }

    return card;
  };

  const renderSwipeStack = () => {
    const stage = $('#deck-stage');
    stage.textContent = '';
    if (!swipeQueue.length) swipeQueue = shuffle(getFilteredOx());

    const currentQ = swipeQueue[0];
    const nextQ = swipeQueue[1];

    if (nextQ) stage.append(createSwipeCardEl(nextQ, true));
    if (currentQ) {
      topCardEl = createSwipeCardEl(currentQ, false);
      stage.append(topCardEl);
    }
  };

  const createInlineDiagBtn = qId => {
    const diag = DIAGRAMS.find(d => d.qIds.includes(qId));
    if (!diag) return null;
    const wrap = el('div');
    const btn = el('button', {
      type: 'button',
      class: 'inline-diag-btn',
      text: `🎬 図解アニメを見る（${diag.title}）`,
      onclick: () => {
        if (wrap.querySelector('.inline-diag-wrap')) return;
        const box = el('div', { class: 'inline-diag-wrap' });
        box.innerHTML = diag.svg;
        wrap.append(box);
        btn.hidden = true;
      }
    });
    wrap.append(btn);
    return wrap;
  };

  const commitSwipe = (guessTrue, cardEl = topCardEl) => {
    if (!swipeQueue.length || !cardEl) return;
    const q = swipeQueue.shift();
    const isCorrect = guessTrue === q.a;

    const dir = guessTrue ? 1 : -1;
    cardEl.style.transition = 'transform 0.28s ease-out, opacity 0.28s ease-out';
    cardEl.style.transform = `translateX(${dir * 420}px) rotate(${dir * 22}deg)`;
    cardEl.style.opacity = '0';

    const rect = cardEl.getBoundingClientRect();
    const res = recordAnswer(q, isCorrect, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });

    const fb = $('#swipe-feedback');
    fb.hidden = false;
    fb.className = `swipe-feedback ${isCorrect ? 'ok' : 'ng'}`;
    fb.innerHTML = '';
    fb.append(
      el('b', { text: isCorrect ? `✅ 正解！ +${res.gainFollowers}フォロワー` : `❌ 正解は「${q.a ? '○ ホント' : '✕ ウソ'}」` }),
      el('p', { text: `💡 ${q.point}` }),
      createInlineDiagBtn(q.id)
    );

    setTimeout(() => renderSwipeStack(), 170);
  };

  $('#btn-fake').addEventListener('click', () => commitSwipe(false));
  $('#btn-fact').addEventListener('click', () => commitSwipe(true));

  /* ---------- 2. タイムラインビュー ---------- */
  let tlPool = [];
  let tlCursor = 0;

  const initTimeline = () => {
    const feed = $('#timeline-feed');
    feed.textContent = '';
    const base = activeField === 'all' ? ALL_QS : ALL_QS.filter(q => q.f === activeField);
    tlPool = shuffle(base);
    tlCursor = 0;
    appendTimelineBatch(6);
  };

  const appendTimelineBatch = count => {
    const feed = $('#timeline-feed');
    const oldMore = feed.querySelector('.load-more-btn');
    if (oldMore) oldMore.remove();

    const slice = tlPool.slice(tlCursor, tlCursor + count);
    tlCursor += slice.length;

    slice.forEach(q => {
      const f = FIELDS[q.f];
      const post = el('article', { class: 'post-card' });
      const optsWrap = el('div', { class: 'post-options' });
      const noteSlot = el('div');

      const choices = q.t === 'ox'
        ? [{ txt: '○ 正しい（ホント）', ok: q.a === true }, { txt: '✕ 誤り（ウソ）', ok: q.a === false }]
        : shuffle(q.c.map((txt, idx) => ({ txt, ok: idx === 0 })));

      const btns = choices.map(ch => {
        const b = el('button', { type: 'button', class: 'post-opt', text: ch.txt });
        b.dataset.ok = String(ch.ok);
        b.addEventListener('click', () => {
          if (post.dataset.done) return;
          post.dataset.done = '1';
          btns.forEach(x => {
            x.disabled = true;
            if (x.dataset.ok === 'true') x.classList.add('is-ok');
          });
          if (b.dataset.ok !== 'true') b.classList.add('is-ng');

          const r = b.getBoundingClientRect();
          const res = recordAnswer(q, b.dataset.ok === 'true', { x: r.left + r.width / 2, y: r.top });

          noteSlot.append(
            el('div', { class: 'comm-note' },
              el('div', { class: 'comm-note-head', text: b.dataset.ok === 'true' ? `🌐 コミュニティノート採用！ +${res.gainFollowers}フォロワー` : '🌐 コミュニティノート（解説）' }),
              el('p', { class: 'comm-note-point', text: `💡 ${q.point}` }),
              el('p', { class: 'comm-note-trap', text: q.trap }),
              createInlineDiagBtn(q.id)
            )
          );
        });
        optsWrap.append(b);
        return b;
      });

      post.append(
        el('div', { class: 'post-head' },
          el('div', { class: 'post-avatar', text: f.icon, style: `background:${f.color}` }),
          el('div', {},
            el('div', { class: 'post-author', text: `${f.name}出題アカウント` }),
            el('div', { class: 'post-meta', text: `${f.handle} · ${q.badge}` })
          )
        ),
        el('p', { class: 'post-body', text: q.q }),
        optsWrap,
        noteSlot
      );
      feed.append(post);
    });

    if (tlCursor < tlPool.length) {
      feed.append(
        el('button', {
          type: 'button',
          class: 'load-more-btn',
          text: 'さらに投稿を読み込む ↓',
          onclick: () => appendTimelineBatch(6)
        })
      );
    }
  };

  /* ---------- 3. 30秒 RUSH ---------- */
  let rushInterval = 0;
  let rushLeft = 30.0;
  let rushScore = 0;
  let rushQ = null;
  let rushDeck = [];

  const nextRushQ = () => {
    if (!rushDeck.length) rushDeck = shuffle(ALL_QS.filter(q => q.t === 'ox'));
    rushQ = rushDeck.pop();
    const f = FIELDS[rushQ.f];
    $('#rush-tag').textContent = `${f.icon} ${f.name}`;
    $('#rush-q').textContent = rushQ.q;
  };

  const startRush = () => {
    rushLeft = 30.0;
    rushScore = 0;
    rushDeck = shuffle(ALL_QS.filter(q => q.t === 'ox'));
    $('#rush-intro').hidden = true;
    $('#rush-result').hidden = true;
    $('#rush-play').hidden = false;
    $('#rush-score-num').textContent = '0';
    nextRushQ();

    clearInterval(rushInterval);
    let last = performance.now();
    rushInterval = setInterval(() => {
      const now = performance.now();
      rushLeft -= (now - last) / 1000;
      last = now;
      if (rushLeft <= 0) {
        clearInterval(rushInterval);
        endRush();
      } else {
        $('#rush-timer').textContent = rushLeft.toFixed(1);
      }
    }, 80);
  };

  const answerRush = guessTrue => {
    if (!rushQ || rushLeft <= 0) return;
    const ok = guessTrue === rushQ.a;
    if (ok) {
      rushScore++;
      rushLeft += 1.0;
      $('#rush-score-num').textContent = String(rushScore);
      recordAnswer(rushQ, true, { x: window.innerWidth / 2, y: window.innerHeight * 0.4 });
    } else {
      recordAnswer(rushQ, false, null);
    }
    nextRushQ();
  };

  const endRush = () => {
    $('#rush-play').hidden = true;
    $('#rush-result').hidden = false;
    $('#rush-res-score').textContent = String(rushScore);
    const isBest = rushScore > state.rushBest;
    if (isBest) {
      state.rushBest = rushScore;
      save();
      sfxBuzz();
      confetti(60, window.innerWidth / 2, window.innerHeight * 0.4);
    }
    $('#rush-best-score').textContent = String(state.rushBest);
    $('#rush-res-gain').textContent = isBest ? '🏆 NEW RECORD 更新!!' : `ハイスコア: ${state.rushBest}問`;
  };

  $('#btn-rush-start').addEventListener('click', startRush);
  $('#btn-rush-retry').addEventListener('click', startRush);
  $('#rush-btn-fake').addEventListener('click', () => answerRush(false));
  $('#rush-btn-fact').addEventListener('click', () => answerRush(true));

  /* ---------- 4. 図解アニメ一覧 ---------- */
  const renderDiagrams = () => {
    const list = $('#diagrams-list');
    list.textContent = '';
    DIAGRAMS.forEach(d => {
      const f = FIELDS[d.f];
      const stage = el('div', { class: 'diag-stage' });
      stage.innerHTML = d.svg;

      const replayBtn = el('button', {
        type: 'button',
        class: 'diag-replay',
        text: '↻ 再生',
        onclick: () => {
          stage.innerHTML = '';
          void stage.offsetWidth;
          stage.innerHTML = d.svg;
          tone(784, 0.08);
        }
      });

      list.append(
        el('article', { class: 'diag-card' },
          el('div', { class: 'diag-head' },
            el('div', {},
              el('h3', { class: 'diag-title', text: `${f.icon} ${d.title}` }),
              el('p', { class: 'diag-sub', text: d.sub })
            ),
            replayBtn
          ),
          stage
        )
      );
    });
  };

  /* ---------- 5. 弱点ノート ---------- */
  const renderNotes = () => {
    const list = $('#notes-list');
    list.textContent = '';
    if (!state.weakIds.length) {
      list.append(
        el('div', { class: 'note-item', style: 'text-align:center; padding:32px;' },
          el('b', { text: '弱点ノートは空です ✨' }),
          el('p', { style: 'color:var(--muted); font-size:0.85rem;', text: 'ライブ劇場やスワイプ仕分けで間違えた問題が自動でここにピン留めされます。' })
        )
      );
      return;
    }

    state.weakIds.forEach(id => {
      const q = ALL_QS.find(x => x.id === id);
      if (!q) return;
      const f = FIELDS[q.f];
      list.append(
        el('div', { class: 'note-item' },
          el('div', { class: 'note-item-head' },
            el('span', { text: `${f.icon} ${f.name} · ${q.badge}` }),
            el('button', {
              type: 'button',
              class: 'note-clear-btn',
              text: '✓ 克服した',
              onclick: () => {
                state.weakIds = state.weakIds.filter(x => x !== id);
                save();
                renderAllStats();
                renderNotes();
              }
            })
          ),
          el('p', { style: 'margin:0 0 8px; font-weight:700;', text: q.q }),
          el('p', { style: 'margin:0 0 4px; color:var(--fact); font-weight:700; font-size:0.86rem;', text: `💡 結論：${q.point}` }),
          el('p', { style: 'margin:0; color:var(--muted); font-size:0.8rem;', text: q.trap })
        )
      );
    });
  };

  /* ---------- ビュー切替 ---------- */
  const VIEW_TITLES = {
    live: '📺 ライブ劇場（受動×論破）',
    swipe: '⚡ スワイプ仕分け',
    timeline: '💬 タイムライン',
    rush: '🔥 30秒 RUSH',
    diagrams: '🎬 図解アニメ',
    notes: '📌 弱点ノート'
  };

  const switchView = view => {
    activeView = view;
    clearInterval(rushInterval);
    $('#view-title').textContent = VIEW_TITLES[view];
    $$('.view-pane').forEach(p => { p.hidden = p.id !== `view-${view}`; });
    $$('[data-view]').forEach(b => b.classList.toggle('active', b.dataset.view === view));

    if (view === 'live') playNextEpisode();
    if (view === 'timeline' && !$('#timeline-feed').children.length) initTimeline();
    if (view === 'diagrams') renderDiagrams();
    if (view === 'notes') renderNotes();
    if (view === 'rush') {
      $('#rush-best-score').textContent = String(state.rushBest);
      $('#rush-intro').hidden = false;
      $('#rush-play').hidden = true;
      $('#rush-result').hidden = true;
    }
  };

  $$('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  const toggleSound = () => {
    state.sound = !state.sound;
    if (!state.sound && synth) synth.cancel();
    save();
    renderAllStats();
    if (state.sound) tone(660, 0.08);
  };
  $('#btn-sound').addEventListener('click', toggleSound);
  $('#m-sound').addEventListener('click', toggleSound);

  $('#btn-reset').addEventListener('click', () => {
    if (!confirm('フォロワー・資産データをすべてリセットしますか？')) return;
    state = freshState();
    combo = 0;
    save();
    renderAllStats();
    initSwipeDeck();
    if (activeView === 'notes') renderNotes();
  });

  document.addEventListener('keydown', e => {
    if (activeView !== 'swipe') return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); commitSwipe(false); }
    else if (e.key === 'ArrowRight') { e.preventDefault(); commitSwipe(true); }
  });

  /* ---------- スマホ用タッチ音声アンロック & PWA ---------- */
  const unlockMobileAudio = () => {
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch (_) {}
    document.removeEventListener('pointerdown', unlockMobileAudio);
  };
  document.addEventListener('pointerdown', unlockMobileAudio, { passive: true });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }

  /* ---------- 起動 ---------- */
  renderAllStats();
  renderFieldChips();
  renderTrends();
  initSwipeDeck();
  liveQueue = buildAllEpisodes();
  playNextEpisode();
})();
