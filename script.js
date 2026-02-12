/* ================================================
   AI Video Prompt Submission – Script
   ================================================ */

(() => {
  'use strict';

  // ===== Instructor Data =====
  const instructors = [
    'アナスタシア', 'アリア', 'アリーサ', 'アリーナ', 'アリッサ',
    'アリョーナ', 'アレナ', 'アロマ', 'アンナ', 'イーナ',
    'イザベラ', 'イリーナ', 'イリシュカ', 'ヴァレリア', 'ヴィヴィ',
    'ヴィクトリア', 'ヴェラ', 'ヴェロニカ', 'ウリア', 'エヴァ',
    'エカテリーナ', 'エミリー', 'エリー', 'エリッサ', 'オクサーナ',
    'オルガ', 'カテリーナ', 'カミーラ', 'ガリーナ', 'カリナ',
    'クシューシャ', 'クリスティーナ', 'ケリー', 'サーシャ', 'ジャスティン',
    'ジャスミン', 'シンディー', 'スヴェトラーナ', 'ゾーイ', 'ソーニャ',
    'ソフィア', 'ターニャ', 'タチアナ', 'タマラ', 'ダリヤ',
    'ディアナ', 'ティナ', 'ドミニカ', 'ナスチャ', 'ナターシャ',
    'ナタリア', 'ナディア', 'ニカ', 'ニキータ', 'バーバラ',
    'パメラ', 'パリーナ', 'ハンナ', 'フェオドラ', 'ベティー',
    'ポリーナ', 'マーシャ', 'マリナ', 'マルティーナ', 'ミラ',
    'ミリア', 'メリッサ', 'ララ', 'リザ', 'リナ',
    'リューダ', 'リリー', 'レーラ', 'ローザ', 'ローラ'
  ];

  // ===== Nickname Validation =====
  const NICKNAME_REGEX = /^[a-zA-Z]+$/;

  function isValidNickname(value) {
    const v = value.trim();
    return v.length > 0 && v.length <= 20 && NICKNAME_REGEX.test(v);
  }

  // ===== Banned Words Filter =====
  const BANNED_WORDS = [
    // 暴力系
    '殺す', '殺し', '殺した', '殺して', '殺され', '殺人',
    '死ぬ', '死ね', '死んで', '死体',
    '殴る', '殴って', '殴り',
    '刺す', '刺し', '刺して',
    '撃つ', '撃って', '撃ち',
    '爆破', '爆弾', 'テロ', '拳銃', 'ナイフ', '包丁で刺',
    '血まみれ', '戦争', '武器', '拷問', '拷問する',
    '首を絞め', '絞殺', '斬る', '斬首', '視殺',
    '自殺', '自傷',
    // 卑猥系
    '裸', '全裸', 'ヌード', '脱ぐ', '脱いで', '脱がして',
    'セックス', 'エッチ', 'エロ', 'アダルト',
    '下着', 'パンツ', 'ブラジャー',
    '胸を見せ', '胸を出', 'おっぱい', 'ちんちん',
    'キス', '抱きつ', '抱き合',
    '婲婆', '風俗', 'ソープ', 'デリヘル',
    'レイプ', '痴漢', '変態', 'フェチ',
    '淫ら', '卸な',
    'ビキニ', '水着を脱',
    'ポルノ', 'AV', 'オナニー',
    // 差別・ハラスメント系
    '死ね', '消えろ', 'クソ', 'バカ', 'アホ',
    'キモい', 'キモい', '気持ち悪い',
    'ゴミ', 'カス', 'クズ',
    '下品', '坂足', '下げす',
  ];

  function containsBannedWord(text) {
    const lower = text.toLowerCase();
    return BANNED_WORDS.find(word => lower.includes(word.toLowerCase())) || null;
  }

  // ===== DOM Elements =====
  const grid = document.getElementById('instructorGrid');
  const searchInput = document.getElementById('searchInput');
  const selectedDisplay = document.getElementById('selectedDisplay');
  const selectedAvatar = document.getElementById('selectedAvatar');
  const selectedName = document.getElementById('selectedName');
  const clearBtn = document.getElementById('clearSelection');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const inputNickname = document.getElementById('inputNickname');
  const nicknameHint = document.getElementById('nicknameHint');
  const inputPlace = document.getElementById('inputPlace');
  const inputState = document.getElementById('inputState');
  const inputTime = document.getElementById('inputTime');
  const inputAction = document.getElementById('inputAction');

  // Hidden form (Formsubmit.co)
  const formMessage = document.getElementById('formMessage');
  const hiddenForm = document.getElementById('hiddenForm');

  // Daily limit elements
  const dailyLimitEl = document.getElementById('dailyLimit');
  const remainingCountEl = document.getElementById('remainingCount');
  const DAILY_LIMIT = 30;
  const STORAGE_KEY = 'ai_prompt_daily';

  let currentInstructor = null;

  // ===== Build Instructor Grid =====
  function buildGrid() {
    instructors.forEach(name => {
      const item = document.createElement('div');
      item.className = 'instructor-item';
      item.dataset.name = name;

      const avatar = document.createElement('img');
      avatar.className = 'instructor-avatar loading';
      avatar.alt = name;
      avatar.loading = 'lazy';
      avatar.src = `images/${name}.png`;
      avatar.onload = () => avatar.classList.remove('loading');
      avatar.onerror = () => {
        avatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2a2a3e&color=c471f5&size=128&font-size=0.4&bold=true`;
        avatar.classList.remove('loading');
      };

      const label = document.createElement('span');
      label.className = 'instructor-name';
      label.textContent = name;

      item.appendChild(avatar);
      item.appendChild(label);
      item.addEventListener('click', () => selectInstructor(name, avatar.src));

      grid.appendChild(item);
    });
  }

  // ===== Instructor Selection =====
  function selectInstructor(name, avatarSrc) {
    grid.querySelectorAll('.instructor-item').forEach(el => el.classList.remove('selected'));

    const item = grid.querySelector(`[data-name="${name}"]`);
    if (item) item.classList.add('selected');

    currentInstructor = name;

    selectedAvatar.src = avatarSrc;
    selectedName.textContent = name;
    selectedDisplay.classList.add('visible');

    setTimeout(() => {
      document.getElementById('promptSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);

    updateSubmitState();
  }

  function clearSelection() {
    currentInstructor = null;
    grid.querySelectorAll('.instructor-item').forEach(el => el.classList.remove('selected'));
    selectedDisplay.classList.remove('visible');
    updateSubmitState();
  }

  // ===== Search / Filter =====
  function filterInstructors(query) {
    const q = query.trim().toLowerCase();
    grid.querySelectorAll('.instructor-item').forEach(item => {
      const name = item.dataset.name.toLowerCase();
      if (!q || name.includes(q)) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  }

  // ===== Nickname Validation UI =====
  function validateNicknameUI() {
    const val = inputNickname.value.trim();
    if (val.length === 0) {
      // Empty – neutral state
      inputNickname.classList.remove('input-error');
      nicknameHint.classList.remove('error');
      nicknameHint.textContent = '半角英数字のみ・20文字以内';
    } else if (!isValidNickname(val)) {
      inputNickname.classList.add('input-error');
      nicknameHint.classList.add('error');
      if (!NICKNAME_REGEX.test(val)) {
        nicknameHint.textContent = '半角英字（a-z）のみ使用できます';
      } else {
        nicknameHint.textContent = '20文字以内で入力してください';
      }
    } else {
      inputNickname.classList.remove('input-error');
      nicknameHint.classList.remove('error');
      nicknameHint.textContent = `✓ ${val}（${val.length}/20）`;
    }
  }

  // ===== Daily Limit Helpers =====
  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function getDailyData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.date === getTodayKey()) return data;
      }
    } catch (e) { /* ignore */ }
    // New day or no data – reset
    const fresh = { date: getTodayKey(), used: 0 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }

  function getRemaining() {
    return Math.max(0, DAILY_LIMIT - getDailyData().used);
  }

  function incrementUsed() {
    const data = getDailyData();
    data.used++;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function updateLimitUI() {
    const remaining = getRemaining();
    remainingCountEl.textContent = remaining;
    dailyLimitEl.classList.remove('warning', 'depleted');
    if (remaining === 0) {
      dailyLimitEl.classList.add('depleted');
    } else if (remaining <= 5) {
      dailyLimitEl.classList.add('warning');
    }
  }

  // ===== Form State =====
  function updateSubmitState() {
    const hasNickname = isValidNickname(inputNickname.value);
    const hasInstructor = !!currentInstructor;
    const hasAnyText = inputPlace.value.trim() || inputState.value.trim() || inputTime.value.trim() || inputAction.value.trim();
    const hasRemaining = getRemaining() > 0;
    submitBtn.disabled = !(hasNickname && hasInstructor && hasAnyText && hasRemaining);
  }

  // ===== Submit via Formsubmit.co =====
  async function handleSubmit(e) {
    e.preventDefault();

    // Check daily limit
    if (getRemaining() <= 0) {
      showToast('本日の送信回数の上限に達しました', 'error');
      return;
    }

    // Validate nickname
    if (!isValidNickname(inputNickname.value)) {
      showToast('ニックネームを正しく入力してください', 'error');
      inputNickname.focus();
      return;
    }

    if (!currentInstructor) {
      showToast('講師を選択してください', 'error');
      return;
    }

    const hasAnyText = inputPlace.value.trim() || inputState.value.trim() || inputTime.value.trim() || inputAction.value.trim();
    if (!hasAnyText) {
      showToast('プロンプトを入力してください', 'error');
      return;
    }

    // Check banned words in 何をしている
    const bannedWord = containsBannedWord(inputAction.value);
    if (bannedWord) {
      showToast(`「${bannedWord}」は使用できません。内容を修正してください`, 'error');
      inputAction.focus();
      return;
    }

    // Build combined message
    const lines = [];
    lines.push(`動画内で『${inputNickname.value.trim()}さん』と呼びかける。`);
    lines.push(`冒頭で『こんにちは、${currentInstructor}です。』と笑顔で挨拶する。`);
    if (inputPlace.value.trim()) lines.push(`場所: ${inputPlace.value.trim()}`);
    if (inputState.value.trim()) lines.push(`状態: ${inputState.value.trim()}`);
    if (inputTime.value.trim()) lines.push(`時: ${inputTime.value.trim()}`);
    if (inputAction.value.trim()) lines.push(`何をしている: ${inputAction.value.trim()}`);

    // Show loading
    submitBtn.disabled = true;
    submitBtnText.textContent = '送信中...';

    // Send via AJAX, then redirect to Sora
    const formData = new FormData();
    formData.append('プロンプト', lines.join('\n'));
    formData.append('_subject', '🎬 AI動画プロンプト依頼');
    formData.append('_captcha', 'false');
    formData.append('_template', 'table');

    try {
      await fetch('https://formsubmit.co/ajax/tomoyamashanxia@gmail.com', {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });
      incrementUsed();
      updateLimitUI();
      // Redirect to Sora regardless of response
      window.location.href = 'https://sora.chatgpt.com/invite?code=GFMNHS';
    } catch (err) {
      // Even if network fails, still redirect
      window.location.href = 'https://sora.chatgpt.com/invite?code=GFMNHS';
    }
  }

  // ===== Toast Notification =====
  function showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('visible');
      });
    });

    setTimeout(() => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 400);
    }, 3000);
  }

  // ===== Event Listeners =====
  inputNickname.addEventListener('input', () => {
    // Strip non-alphanumeric characters in real-time
    inputNickname.value = inputNickname.value.replace(/[^a-zA-Z]/g, '');
    validateNicknameUI();
    updateSubmitState();
  });
  searchInput.addEventListener('input', e => filterInstructors(e.target.value));
  clearBtn.addEventListener('click', clearSelection);
  submitBtn.addEventListener('click', handleSubmit);
  [inputPlace, inputState, inputTime, inputAction].forEach(el => {
    el.addEventListener('input', updateSubmitState);
  });

  // ===== Init =====
  buildGrid();
  updateLimitUI();
  updateSubmitState();
})();
