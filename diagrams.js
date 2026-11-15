window.FP3_DIAGRAMS = [
  {
    id: 'D_SEESAW',
    f: 'fin',
    title: '金利と債券価格のシーソー',
    sub: 'なぜ好景気で金利が上がると、債券価格は下がるのか？',
    qIds: ['F01'],
    svg: `
      <svg viewBox="0 0 360 190" class="diag-svg diag-seesaw" aria-label="金利と債券価格のシーソー図解">
        <defs>
          <linearGradient id="gBeam" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#1d9bf0"/>
            <stop offset="100%" stop-color="#f91880"/>
          </linearGradient>
        </defs>
        <!-- 支点 -->
        <polygon points="180,120 158,162 202,162" fill="#2f3336" stroke="#71767b" stroke-width="2"/>
        <line x1="60" y1="162" x2="300" y2="162" stroke="#2f3336" stroke-width="2"/>
        <!-- 動くシーソー -->
        <g class="seesaw-arm">
          <rect x="45" y="114" width="270" height="10" rx="5" fill="url(#gBeam)"/>
          <g transform="translate(75, 62)">
            <rect x="-38" y="0" width="76" height="44" rx="10" fill="#0d2238" stroke="#1d9bf0" stroke-width="2"/>
            <text x="0" y="19" text-anchor="middle" fill="#1d9bf0" font-size="11" font-weight="800">市中金利</text>
            <text x="0" y="36" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900">UP ↑</text>
          </g>
          <g transform="translate(285, 62)">
            <rect x="-38" y="0" width="76" height="44" rx="10" fill="#2b0f1f" stroke="#f91880" stroke-width="2"/>
            <text x="0" y="19" text-anchor="middle" fill="#f91880" font-size="11" font-weight="800">債券価格</text>
            <text x="0" y="36" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="900">DOWN ↓</text>
          </g>
        </g>
        <text x="180" y="182" text-anchor="middle" fill="#8b98b8" font-size="11" font-weight="700">金利と債券価格は常に逆向き（逆相関）</text>
      </svg>
    `
  },
  {
    id: 'D_INS_TAX',
    f: 'risk',
    title: '死亡保険金の税金 3パターン',
    sub: '誰が払い・誰が被保険者で・誰が受け取るか（3秒で判別）',
    qIds: ['R02'],
    svg: `
      <svg viewBox="0 0 360 200" class="diag-svg diag-instax" aria-label="死亡保険金の税金3パターン図解">
        <!-- パターン1 -->
        <g class="tax-row row-1">
          <rect x="12" y="14" width="336" height="50" rx="12" fill="#16181c" stroke="#2f3336"/>
          <text x="26" y="36" fill="#e7e9ea" font-size="12" font-weight="800">① 契約者 ＝ 被保険者</text>
          <text x="26" y="53" fill="#71767b" font-size="10">例：夫が払い、夫が死亡、妻が受取</text>
          <rect x="235" y="24" width="100" height="30" rx="8" fill="rgba(0,186,124,0.2)" stroke="#00ba7c"/>
          <text x="285" y="44" text-anchor="middle" fill="#00ba7c" font-size="13" font-weight="900">相続税</text>
        </g>
        <!-- パターン2 -->
        <g class="tax-row row-2">
          <rect x="12" y="74" width="336" height="50" rx="12" fill="#16181c" stroke="#2f3336"/>
          <text x="26" y="96" fill="#e7e9ea" font-size="12" font-weight="800">② 契約者 ＝ 受取人</text>
          <text x="26" y="113" fill="#71767b" font-size="10">例：夫が払い、妻が死亡、夫が受取</text>
          <rect x="235" y="84" width="100" height="30" rx="8" fill="rgba(29,155,240,0.2)" stroke="#1d9bf0"/>
          <text x="285" y="104" text-anchor="middle" fill="#1d9bf0" font-size="12" font-weight="900">所得税(一時)</text>
        </g>
        <!-- パターン3 -->
        <g class="tax-row row-3">
          <rect x="12" y="134" width="336" height="50" rx="12" fill="#16181c" stroke="#2f3336"/>
          <text x="26" y="156" fill="#e7e9ea" font-size="12" font-weight="800">③ 全員バラバラ</text>
          <text x="26" y="173" fill="#71767b" font-size="10">例：夫が払い、妻が死亡、子が受取</text>
          <rect x="235" y="144" width="100" height="30" rx="8" fill="rgba(249,24,128,0.2)" stroke="#f91880"/>
          <text x="285" y="164" text-anchor="middle" fill="#f91880" font-size="13" font-weight="900">贈与税</text>
        </g>
      </svg>
    `
  },
  {
    id: 'D_PENSION',
    f: 'life',
    title: '年金の繰上げ・繰下げレート',
    sub: '65歳を基準に「-0.4%/月」vs「+0.7%/月」の伸び方',
    qIds: ['L06'],
    svg: `
      <svg viewBox="0 0 360 190" class="diag-svg diag-pension" aria-label="年金の繰上げ繰下げ図解">
        <line x1="30" y1="130" x2="330" y2="130" stroke="#2f3336" stroke-width="2"/>
        <!-- 60歳 -->
        <rect x="44" y="96" width="44" height="34" rx="6" fill="#f91880" class="bar-grow-1"/>
        <text x="66" y="88" text-anchor="middle" fill="#f91880" font-size="12" font-weight="900">76%</text>
        <text x="66" y="148" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">60歳</text>
        <text x="66" y="164" text-anchor="middle" fill="#71767b" font-size="10">-0.4%/月</text>

        <!-- 65歳 -->
        <rect x="158" y="75" width="44" height="55" rx="6" fill="#1d9bf0" class="bar-grow-2"/>
        <text x="180" y="67" text-anchor="middle" fill="#1d9bf0" font-size="12" font-weight="900">100%</text>
        <text x="180" y="148" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">65歳(基準)</text>

        <!-- 75歳 -->
        <rect x="272" y="28" width="44" height="102" rx="6" fill="#00ba7c" class="bar-grow-3"/>
        <text x="294" y="20" text-anchor="middle" fill="#00ba7c" font-size="13" font-weight="900">184%</text>
        <text x="294" y="148" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">75歳</text>
        <text x="294" y="164" text-anchor="middle" fill="#00ba7c" font-size="10">+0.7%/月</text>
      </svg>
    `
  },
  {
    id: 'D_SONEKI',
    f: 'tax',
    title: '損益通算（富士山上）の相殺アニメ',
    sub: '他の黒字と合算して節税できるのは4つの所得だけ',
    qIds: ['T01'],
    svg: `
      <svg viewBox="0 0 360 190" class="diag-svg diag-soneki" aria-label="損益通算の図解">
        <!-- 黒字の柱 -->
        <rect x="34" y="34" width="84" height="110" rx="10" fill="#1d9bf0" opacity="0.85"/>
        <text x="76" y="82" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">給与など</text>
        <text x="76" y="100" text-anchor="middle" fill="#fff" font-size="12" font-weight="900">黒字</text>

        <!-- マイナス記号 -->
        <text x="142" y="96" text-anchor="middle" fill="#ffd400" font-size="24" font-weight="900">−</text>

        <!-- 赤字の柱（アニメーションで引き寄せられる） -->
        <g class="soneki-slide">
          <rect x="168" y="64" width="166" height="80" rx="12" fill="rgba(0,186,124,0.16)" stroke="#00ba7c" stroke-width="2"/>
          <text x="251" y="90" text-anchor="middle" fill="#00ba7c" font-size="13" font-weight="900">不・事・山・譲</text>
          <text x="251" y="109" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">（富士山上）の赤字</text>
          <text x="251" y="129" text-anchor="middle" fill="#71767b" font-size="10">※雑所得・一時所得はNG</text>
        </g>
        <text x="180" y="172" text-anchor="middle" fill="#ffd400" font-size="11" font-weight="800">課税所得が圧縮されて節税になる！</text>
      </svg>
    `
  },
  {
    id: 'D_BLDG',
    f: 're',
    title: '建蔽率 vs 容積率（立体イメージ）',
    sub: '「1階の面積」か「全フロアの合計」かで使う率が違う',
    qIds: ['E04'],
    svg: `
      <svg viewBox="0 0 360 190" class="diag-svg diag-bldg" aria-label="建蔽率と容積率の図解">
        <!-- 敷地 -->
        <rect x="40" y="138" width="120" height="22" rx="4" fill="#2f3336"/>
        <text x="100" y="153" text-anchor="middle" fill="#e7e9ea" font-size="10" font-weight="700">敷地 200㎡</text>
        <!-- 1階（建蔽率） -->
        <rect x="56" y="104" width="72" height="32" rx="4" fill="#fb923c" class="bldg-floor-1"/>
        <text x="92" y="124" text-anchor="middle" fill="#000" font-size="11" font-weight="900">建蔽率 60%</text>

        <!-- 右側：容積率 -->
        <rect x="200" y="138" width="120" height="22" rx="4" fill="#2f3336"/>
        <text x="260" y="153" text-anchor="middle" fill="#e7e9ea" font-size="10" font-weight="700">敷地 200㎡</text>
        <rect x="216" y="104" width="72" height="32" rx="4" fill="#1d9bf0"/>
        <rect x="216" y="68" width="72" height="32" rx="4" fill="#38bdf8" class="bldg-floor-2"/>
        <rect x="216" y="32" width="72" height="32" rx="4" fill="#7dd3fc" class="bldg-floor-3"/>
        <text x="252" y="22" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="900">容積率 200% (合計400㎡)</text>
      </svg>
    `
  },
  {
    id: 'D_INH_TIME',
    f: 'inh',
    title: '相続手続き 3・4・10カ月の壁',
    sub: '死亡を知った日から走る3つの重要期限',
    qIds: ['I02'],
    svg: `
      <svg viewBox="0 0 360 190" class="diag-svg diag-timeline" aria-label="相続手続き期限の図解">
        <line x1="34" y1="88" x2="326" y2="88" stroke="#2f3336" stroke-width="4" stroke-linecap="round"/>
        <line x1="34" y1="88" x2="326" y2="88" stroke="#a78bfa" stroke-width="4" stroke-linecap="round" class="tl-progress"/>

        <circle cx="70" cy="88" r="10" fill="#f91880"/>
        <text x="70" y="64" text-anchor="middle" fill="#f91880" font-size="13" font-weight="900">3カ月</text>
        <text x="70" y="118" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">相続放棄</text>
        <text x="70" y="133" text-anchor="middle" fill="#71767b" font-size="10">限定承認</text>

        <circle cx="180" cy="88" r="10" fill="#1d9bf0"/>
        <text x="180" y="64" text-anchor="middle" fill="#1d9bf0" font-size="13" font-weight="900">4カ月</text>
        <text x="180" y="118" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">準確定申告</text>
        <text x="180" y="133" text-anchor="middle" fill="#71767b" font-size="10">所得税</text>

        <circle cx="292" cy="88" r="10" fill="#00ba7c"/>
        <text x="292" y="64" text-anchor="middle" fill="#00ba7c" font-size="13" font-weight="900">10カ月</text>
        <text x="292" y="118" text-anchor="middle" fill="#e7e9ea" font-size="11" font-weight="700">相続税</text>
        <text x="292" y="133" text-anchor="middle" fill="#71767b" font-size="10">申告・納付</text>
      </svg>
    `
  }
];
