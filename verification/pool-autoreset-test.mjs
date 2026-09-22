// Pool auto-recovery unit test
// 模拟: v0.1.2 的 pool/index.ts 关键逻辑 (AUTO_RESET 调度/取消/执行/24h 节流)
// 不依赖真实 GM_* / fanqienovel.com, 纯时间 + 状态机验证
//
// 时间用 mock: setTimeout / Date.now() 都 wrap, 可 fast-forward

const REAL_TIMER = setTimeout;
let now = 1700000000000; // 固定起点
let timerId = 0;
const fakeTimers = new Map(); // id -> { fireAt, fn, args }

function mockSetTimeout(fn, ms, ...args) {
  const id = ++timerId;
  fakeTimers.set(id, { fireAt: now + ms, fn, args });
  return id;
}
function mockClearTimeout(id) {
  fakeTimers.delete(id);
}
function advanceTime(ms) {
  now += ms;
  // 触发到期定时器 (按 fireAt 顺序)
  const due = [...fakeTimers.entries()].filter(([_, t]) => t.fireAt <= now).sort((a, b) => a[1].fireAt - b[1].fireAt);
  for (const [id, t] of due) {
    fakeTimers.delete(id);
    t.fn(...t.args);
  }
}

// 等待所有 microtask (await 链) 完成, 用于 advanceTime 后同步执行 async 回调
async function advanceTimeAsync(ms) {
  advanceTime(ms);
  // 跑空 microtask 队列几次, 让 async/await 链 settle
  for (let i = 0; i < 50; i++) {
    await new Promise(r => REAL_TIMER(r, 0));
  }
}

// GM_* storage mock
const _gmStore = {};
const gmStore = {
  get: (k) => _gmStore[k],
  set: (k, v) => { _gmStore[k] = v; },
  delete: (k) => { delete _gmStore[k]; },
};

// GM_xmlhttpRequest mock (返回成功响应, 让 registerDevice/registerKey 跑通)
async function gmXhr(opts) {
  const path = new URL(opts.url).pathname;
  let responseText = '';
  if (path.includes('device_register')) {
    responseText = JSON.stringify({ device_id: Math.floor(Math.random() * 1e15), device_id_str: 'dev_' + Math.random().toString(36).slice(2, 10), install_id_str: 'inst_' + Math.random().toString(36).slice(2, 10), server_time: now });
  } else if (path.includes('registerkey')) {
    responseText = JSON.stringify({ data: { key: 'AAAA' + Buffer.from('0123456789abcdef').toString('base64'), keyver: 1 } });
  } else if (path.includes('privilege/add')) {
    responseText = JSON.stringify({ code: 0, data: { expire_time: '2099-12-31' } });
  } else {
    responseText = '{}';
  }
  return { status: 200, statusText: 'OK', response: responseText, responseText };
}

// Minimal stub for log + crypto etc
const logLines = [];
const log = (level, mod, msg, extra) => logLines.push({ t: now, level, mod, msg, extra });

// crypto / config mocks (简化)
const defaultConfig = {
  device_id: '0', install_id: '0', device_type: 'placeholder',
  key_info: undefined,
};
const configStore = { currentConfig: { ...defaultConfig } };

// shared_key + b64encode/decode stubs (registerKey 用, 这里 mock 跳过细节)
const shared_key = new Uint8Array(32);
async function subtleImportKey() { return {}; }
async function subtleEncrypt() { return new Uint8Array(16); }
async function getCrypto() { return { getRandomValues: (arr) => { for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256); return arr; } }; }
async function getSubtle() {
  return {
    importKey: subtleImportKey,
    encrypt: subtleEncrypt,
    decrypt: async () => new Uint8Array(16),
  };
}
function b64encode(buf) { return Buffer.from(buf).toString('base64'); }
function b64decode(s) { return new Uint8Array(Buffer.from(s, 'base64')); }
function hex(buf) { return Buffer.from(buf).toString('hex'); }
async function gzip(s) { return new TextEncoder().encode(s); }
async function encryptTT(buf) { return buf; }

// ============================================================================
//   Replicate pool/index.ts key constants + functions
// ============================================================================
const POOL_STORAGE_KEY = 'fqa.device_pool.v1';
const POOL_SIZE = 3;
const FAILURE_THRESHOLD = 2;
const REFILL_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STAGGER_REGISTER_MS = [0, 10_000, 30_000];
const AUTO_RESET_DELAY_MS = 5 * 60 * 1000;
const AUTO_RESET_THROTTLE_MS = 24 * 60 * 60 * 1000;
const AUTO_RESET_PLAN_KEY = 'fqa.auto_reset_plan.v1';
const LAST_AUTO_RESET_KEY = 'fqa.last_auto_reset.v1';

function read(k) { return _gmStore[k]; }
function write(k, v) { _gmStore[k] = v; }
function del(k) { delete _gmStore[k]; }

// apiFetch mock — just call gmXhr
async function apiFetch(url, opts) {
  const r = await gmXhr({ url, method: opts.method, data: opts.body });
  return { ...r, json: () => JSON.parse(r.responseText) };
}

async function registerDevice() {
  const res = await apiFetch('https://i.snssdk.com/service/2/device_register/?tt_data=a', {
    method: 'POST',
    headers: { 'Content-Type': 'application/octet-stream; tt-data=a' },
    body: 'encrypted-stub',
  });
  const j = res.json();
  return {
    device_id: j.device_id_str,
    install_id: j.install_id_str,
    device_type: 'HD1910',
  };
}
async function activatePremium() { return '2099-12-31'; }
async function registerKey(device) {
  const res = await apiFetch('https://reading.snssdk.com/reading/crypt/registerkey?' + device.device_id, {
    method: 'POST', headers: {}, body: 'gzipped-stub',
  });
  return { key: new Uint8Array(16), keyver: 1 };
}

// Pool state + auto-reset logic (replicated)
const listeners = new Set();
let autoResetPlan = null;
const autoResetCancelListeners = new Set();
const autoResetExecuteListeners = new Set();

function loadPool() {
  const raw = read(POOL_STORAGE_KEY);
  if (!raw || !Array.isArray(raw.slots)) return { slots: [], activeIndex: 0 };
  return raw;
}
function savePool(p) { write(POOL_STORAGE_KEY, p); }
function notify() { for (const fn of listeners) fn(); }
function getActiveSlot(p) { return p.slots[p.activeIndex]; }

async function provisionSingleSlot() {
  try {
    const dev = await registerDevice();
    const vip = await activatePremium(dev);
    const keyInfo = await registerKey(dev);
    return {
      device_id: dev.device_id, install_id: dev.install_id, device_type: dev.device_type,
      key_info: keyInfo, vip_expire_time: vip,
      health: 'healthy', failureStreak: 0, lastFailureAt: 0,
      registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: 0,
    };
  } catch (e) {
    log('error', 'pool', 'provisionSingleSlot 失败', { error: String(e) });
    return null;
  }
}

async function initPool() {
  let pool = loadPool();
  if (pool.slots.length === 0) {
    log('info', 'pool', '池子为空, 开始首次注册');
    const slot0 = await provisionSingleSlot();
    if (!slot0) {
      log('warn', 'pool', '首槽注册失败');
      return;
    }
    pool = { slots: [slot0], activeIndex: 0 };
    savePool(pool);
  } else {
    log('info', 'pool', `复用池子 (${pool.slots.length} 个槽位)`);
  }
  // 健康自检
  if (getActiveSlot(pool)?.health === 'dead') {
    const allDead = pool.slots.every(s => s.health === 'dead');
    if (allDead) {
      log('warn', 'pool', '所有槽位 dead, 调度自动 reset');
      detectAllDeadAndSchedule();
    }
  }
  notify();
}

function detectAllDeadAndSchedule() {
  const pool = loadPool();
  if (pool.slots.length === 0) return;
  const allDead = pool.slots.every(s => s.health === 'dead');
  if (!allDead) return;
  if (autoResetPlan) return; // 已调度
  const lastAt = read(LAST_AUTO_RESET_KEY) ?? 0;
  if (now - lastAt < AUTO_RESET_THROTTLE_MS) {
    log('debug', 'pool', '24h 内已自动 reset 过, 不重复调度');
    return;
  }
  scheduleAutoResetInternal(AUTO_RESET_DELAY_MS, now);
}

function scheduleAutoResetInternal(remainingMs, originalScheduledAt) {
  if (autoResetPlan) {
    mockClearTimeout(autoResetPlan.timerId);
  }
  autoResetPlan = {
    timerId: null,
    plannedAt: now + remainingMs,
    scheduledAt: originalScheduledAt,
  };
  write(AUTO_RESET_PLAN_KEY, { plannedAt: autoResetPlan.plannedAt, scheduledAt: autoResetPlan.scheduledAt });
  log('info', 'pool', `自动 reset 已调度: ${Math.round(remainingMs / 1000)}s 后执行`);
  autoResetPlan.timerId = mockSetTimeout(() => { void executeAutoReset(); }, remainingMs);
}

async function executeAutoReset() {
  if (!autoResetPlan) return;
  log('info', 'pool', '执行自动 reset (全 dead 状态恢复)');
  write(LAST_AUTO_RESET_KEY, now);
  del(AUTO_RESET_PLAN_KEY);
  if (autoResetPlan.timerId) mockClearTimeout(autoResetPlan.timerId);
  autoResetPlan = null;
  del(POOL_STORAGE_KEY);
  del('device');
  del('keyinfo');
  configStore.currentConfig = { ...defaultConfig };
  notify();
  try {
    await initPool();
    log('info', 'pool', '自动 reset 完成, 新池子已生效');
  } catch (e) {
    log('error', 'pool', '自动 reset 后 initPool 失败', { error: String(e) });
  }
  for (const fn of autoResetExecuteListeners) {
    try { fn(); } catch (e) {}
  }
}

function getAutoResetPlan() {
  if (!autoResetPlan) {
    const persisted = read(AUTO_RESET_PLAN_KEY);
    if (persisted && persisted.plannedAt > now) {
      const remaining = persisted.plannedAt - now;
      scheduleAutoResetInternal(remaining, persisted.scheduledAt);
      return persisted;
    }
    return null;
  }
  return { plannedAt: autoResetPlan.plannedAt, scheduledAt: autoResetPlan.scheduledAt };
}

function cancelAutoReset() {
  if (!autoResetPlan) return false;
  if (autoResetPlan.timerId) mockClearTimeout(autoResetPlan.timerId);
  autoResetPlan = null;
  del(AUTO_RESET_PLAN_KEY);
  log('info', 'pool', '用户取消了自动 reset 计划');
  for (const fn of autoResetCancelListeners) {
    try { fn(); } catch (e) {}
  }
  return true;
}

function recordFailure() {
  const pool = loadPool();
  const slot = getActiveSlot(pool);
  if (!slot) return { switched: false, reason: 'no active slot' };
  slot.failureStreak += 1;
  slot.lastFailureAt = now;
  if (slot.failureStreak < FAILURE_THRESHOLD) {
    savePool(pool);
    notify();
    return { switched: false, reason: `失败 ${slot.failureStreak}/${FAILURE_THRESHOLD}` };
  }
  slot.health = 'dead';
  slot.refillCooldownUntil = now + REFILL_COOLDOWN_MS;
  log('warn', 'pool', `槽 ${pool.activeIndex} 已标记 dead`, { device_id: slot.device_id });
  // 找 next healthy
  let nextIdx = -1;
  for (let offset = 1; offset <= pool.slots.length; offset++) {
    const idx = (pool.activeIndex + offset) % pool.slots.length;
    if (pool.slots[idx]?.health === 'healthy') { nextIdx = idx; break; }
  }
  if (nextIdx === -1) {
    savePool(pool);
    notify();
    log('warn', 'pool', '无可用 healthy 槽位, 池子空了');
    detectAllDeadAndSchedule();
    return { switched: false, reason: 'no healthy slot available' };
  }
  pool.activeIndex = nextIdx;
  savePool(pool);
  notify();
  return { switched: true, reason: `auto-switched to slot ${nextIdx}` };
}

// ============================================================================
//   Test cases
// ============================================================================
const tests = [];
function test(name, fn) { tests.push({ name, fn }); }

test('初始状态: 没有自动 reset 计划', () => {
  assertEq(getAutoResetPlan(), null, '初始无计划');
});

test('场景 A: 池子全 dead 后调度自动 reset (5min 倒计时)', async () => {
  // Setup: 一个池子, 3 槽都 dead
  write(POOL_STORAGE_KEY, {
    activeIndex: 0,
    slots: [
      { device_id: 'd1', install_id: 'i1', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
      { device_id: 'd2', install_id: 'i2', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
      { device_id: 'd3', install_id: 'i3', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
    ],
  });
  autoResetPlan = null; // 清理

  // 触发: recordFailure 找不到 healthy → detectAllDeadAndSchedule
  const r = recordFailure();
  assertEq(r.reason, 'no healthy slot available', '切换失败原因');

  // 验证: 自动 reset 计划已调度
  const plan = getAutoResetPlan();
  assert(plan !== null, '应该有自动 reset 计划');
  const remaining = plan.plannedAt - now;
  assertEq(remaining, AUTO_RESET_DELAY_MS, `剩余时间应是 ${AUTO_RESET_DELAY_MS}ms`);
  log('info', 'TEST', `✓ 场景 A: 自动 reset 已调度, 剩余 ${Math.round(remaining / 1000)}s`);
});

test('场景 B: 用户取消自动 reset', () => {
  assert(autoResetPlan !== null, '场景 A 应该已经调度');
  const planBefore = getAutoResetPlan();
  assert(planBefore !== null, '应该有计划');

  const ok = cancelAutoReset();
  assertEq(ok, true, 'cancelAutoReset 返回 true');

  assertEq(autoResetPlan, null, 'plan 已清空');
  assertEq(getAutoResetPlan(), null, 'getAutoResetPlan 返 null');
  assertEq(read(AUTO_RESET_PLAN_KEY), undefined, '持久化已清');

  log('info', 'TEST', '✓ 场景 B: 取消成功, plan 和持久化都清空');
});

test('场景 C: 取消后 5min 推进, 不会再触发自动 reset', () => {
  // 此时 autoResetPlan 已被场景 B 清掉
  advanceTime(AUTO_RESET_DELAY_MS + 10_000); // 推 5min10s
  // 不应该自动 reset (timer 已 cancel)
  assertEq(autoResetPlan, null, 'plan 仍是 null');
  // 池子还在全 dead 状态 (POOL_STORAGE_KEY 未变)
  const pool = loadPool();
  const allDead = pool.slots.every(s => s.health === 'dead');
  assert(allDead, '池子仍是全 dead, 但不会自动 reset');
  log('info', 'TEST', '✓ 场景 C: 取消后 5min 推进无自动 reset');
});

test('场景 D: 全 dead → 自动 reset 完整流程 (不取消)', async () => {
  // 清理
  autoResetPlan = null;
  del(LAST_AUTO_RESET_KEY);
  del(AUTO_RESET_PLAN_KEY);
  // 重置池子为全 dead
  write(POOL_STORAGE_KEY, {
    activeIndex: 0,
    slots: [
      { device_id: 'd4', install_id: 'i4', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
      { device_id: 'd5', install_id: 'i5', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
      { device_id: 'd6', install_id: 'i6', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
    ],
  });

  let executeListenerCalled = false;
  autoResetExecuteListeners.add(() => { executeListenerCalled = true; });

  // 触发
  recordFailure();
  const plan = getAutoResetPlan();
  assert(plan !== null, '已调度');
  log('info', 'TEST', `调度时间: ${Math.round((plan.plannedAt - now) / 1000)}s`);

  // 推进 4 分钟: 不应该执行
  advanceTime(4 * 60 * 1000);
  assert(executeListenerCalled === false, '4min 后不应执行');
  assert(loadPool().slots.every(s => s.health === 'dead'), '池子还是全 dead');
  log('info', 'TEST', '✓ 4min 推进, 仍未执行');

  // 推进到 5min01s: 应该执行 (async 等待 microtask)
  await advanceTimeAsync(60 * 1000 + 1000);
  assert(executeListenerCalled === true, '5min 后应执行');
  // 新池子应该至少有一个 healthy slot
  const newPool = loadPool();
  assert(newPool.slots.length > 0, '新池子有 slot');
  assert(newPool.slots.some(s => s.health === 'healthy'), '新池子有 healthy slot');
  log('info', 'TEST', `✓ 场景 D: 5min 后自动 reset 完成, 新池子 ${newPool.slots.length} 个槽, healthy=${newPool.slots.filter(s => s.health === 'healthy').length}`);
});

test('场景 E: 24h 节流 - 第一次 reset 后, 立即再触发不应调度', async () => {
  // 场景 D 刚刚 reset 过, LAST_AUTO_RESET_KEY 应该是 now
  const lastAt = read(LAST_AUTO_RESET_KEY);
  assert(lastAt > 0, 'lastAt 已记录');
  log('info', 'TEST', `lastAt = ${new Date(lastAt).toISOString()}`);

  // 立即模拟再全 dead: registerFail 触发 detectAllDeadAndSchedule
  // 但 throttle 应该拒绝
  write(POOL_STORAGE_KEY, {
    activeIndex: 0,
    slots: [
      { device_id: 'd7', install_id: 'i7', health: 'dead', failureStreak: 2, lastFailureAt: now, registeredAt: now, lastSuccessAt: 0, refillCooldownUntil: now + REFILL_COOLDOWN_MS },
    ],
  });
  autoResetPlan = null;
  recordFailure();
  // 24h 节流: 不应该调度
  const plan = getAutoResetPlan();
  assertEq(plan, null, '24h 节流生效, 不调度');
  log('info', 'TEST', '✓ 场景 E: 24h 节流生效, 第二次 reset 被拒绝');
});

test('场景 F: 24h 后再触发 - 应调度', async () => {
  // 推进 24h + 1s
  advanceTime(24 * 60 * 60 * 1000 + 1000);
  // 再触发
  const before = autoResetPlan;
  recordFailure();
  const plan = getAutoResetPlan();
  assert(plan !== null, '24h 后应能调度');
  log('info', 'TEST', '✓ 场景 F: 24h 后又能调度自动 reset');
});

// Helper
let _asserts = 0; let _fails = 0;
function assert(cond, msg) { if (!cond) { console.error('✗ ASSERT FAIL:', msg); _fails++; } else { _asserts++; } }
function assertEq(actual, expected, msg) { if (actual !== expected) { console.error('✗ ASSERT FAIL:', msg, '- actual:', actual, 'expected:', expected); _fails++; } else { _asserts++; } }

// Run tests sequentially
(async () => {
  console.log('=== v0.1.2 pool auto-recovery unit test ===');
  console.log('时间起点: ' + new Date(now).toISOString());
  console.log('AUTO_RESET_DELAY_MS =', AUTO_RESET_DELAY_MS, '(5 min)');
  console.log('AUTO_RESET_THROTTLE_MS =', AUTO_RESET_THROTTLE_MS, '(24 h)');
  console.log();
  for (const t of tests) {
    console.log(`[TEST] ${t.name}`);
    try { await t.fn(); } catch (e) { console.error('THROW:', e); _fails++; }
  }
  console.log();
  console.log('=== 结果 ===');
  console.log(`断言: ${_asserts} 通过, ${_fails} 失败`);
  console.log(`日志行数: ${logLines.length}`);
  // 输出关键日志
  console.log();
  console.log('关键日志:');
  for (const l of logLines) {
    if (l.level === 'info' && (l.msg.includes('自动 reset') || l.msg.includes('执行') || l.msg.includes('新池子') || l.msg.includes('✓') || l.msg.includes('调度'))) {
      console.log(`  [${new Date(l.t).toISOString()}] ${l.level}/${l.mod}: ${l.msg}`);
    }
  }
  process.exit(_fails > 0 ? 1 : 0);
})();