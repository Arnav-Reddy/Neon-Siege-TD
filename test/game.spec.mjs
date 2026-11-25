import { test, expect } from '@playwright/test';

// Each test gets a fresh context (isolated localStorage). The game opens on the F1 Paddock
// home screen with no active run (S === null); newSave() starts a run from slot 1.

let context;
let page;
let pageErrors;

async function openGame(targetPage) {
  await targetPage.goto('/');
  await expect(targetPage.locator('#home')).toBeVisible();
}

async function newSave(name = 'Test Team') {
  await page.locator('#hmSlots .slot').first().locator('input').fill(name);
  await page.locator('#hmSlots .slot').first().locator('.btn').click();
  await page.waitForFunction(() => S !== null && !ui.home);
}

function freeTile() {
  return page.evaluate(() => {
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!isPath(x, y) && !towerAt(x, y)) return { x, y };
    throw new Error('No free non-path tile');
  });
}

test.beforeEach(async ({ context: freshContext, page: freshPage }) => {
  context = freshContext;
  page = freshPage;
  pageErrors = [];
  // Keep runs deterministic: the in-game updater must not fetch the live index.html.
  await context.route('**/raw.githubusercontent.com/**', route => route.abort());
  const collectErrors = p => p.on('pageerror', error => pageErrors.push(error.message));
  context.on('page', collectErrors);
  collectErrors(page);
  await openGame(page);
});

test.afterEach(() => {
  expect(pageErrors, 'no uncaught page errors').toEqual([]);
});

test('home screen loads clean with five empty slots', async () => {
  await expect(page.locator('#hmSlots .slot.empty')).toHaveCount(5);
  expect(await page.evaluate(() => S)).toBeNull();
  const widget = await page.locator('#w').boundingBox();
  expect(widget.width).toBe(440);
  expect(widget.height).toBe(344);
});

test('new save starts a run', async () => {
  await newSave('Scuderia Test');
  const run = await page.evaluate(() => ({ name:S.name, slot:S.slot, wave:S.wave, gold:S.gold, season:S.season }));
  expect(run).toEqual({ name:'Scuderia Test', slot:1, wave:0, gold:200, season:1 });
  await expect(page.locator('#home')).toBeHidden();
});

test('place tower through dock and canvas mouse input', async () => {
  await newSave();
  const goldBefore = await page.evaluate(() => S.gold);
  await page.locator('.tw').first().click();
  const tile = await freeTile();
  const point = await page.evaluate(({ x, y }) => {
    const rect = document.getElementById('cv').getBoundingClientRect();
    return { x: rect.left + (x + 0.5) * rect.width / COLS, y: rect.top + (y + 0.5) * rect.height / ROWS };
  }, tile);
  await page.mouse.click(point.x, point.y);
  const placed = await page.evaluate(() => ({ gold:S.gold, towers:S.towers.length, cost:TOWERS[0].cost }));
  expect(placed.towers).toBe(1);
  expect(placed.gold).toBe(goldBefore - placed.cost);
});

test('start wave spawns enemies and advances wave state', async () => {
  await newSave();
  const state = await page.evaluate(() => {
    startWave();
    for (let i = 0; i < 600 && S.enemies.length === 0; i++) update(STEP);
    return { waveActive:S.waveActive, wave:S.wave, enemies:S.enemies.length };
  });
  expect(state.waveActive).toBe(true);
  expect(state.wave).toBe(1);
  expect(state.enemies).toBeGreaterThan(0);
});

test('save then reopen the slot preserves wave, gold, and towers', async () => {
  await newSave();
  const tile = await freeTile();
  const result = await page.evaluate(({ x, y }) => {
    S.gold = 4321;
    place(0, x, y);
    S.wave = 7;
    const snap = () => ({ wave:S.wave, gold:S.gold, towers:S.towers.map(t => ({ id:TOWERS[t.type].id, x:t.x, y:t.y, lv:t.lv })) });
    save();
    const before = snap();
    openSlot(1);
    return { before, after:snap() };
  }, tile);
  expect(result.after).toEqual(result.before);
});

test('a pinned mutation is applied on every later mutation of that tower', async () => {
  await newSave();
  const tile = await freeTile();
  await page.evaluate(({ x, y }) => { S.gold = 1e9; place(1, x, y); const t = S.towers[0]; t.lv = 4; openPanel(t); }, tile);
  await page.locator('#pUp').click();
  await expect(page.locator('#mOpts .msel')).toHaveCount(3);
  await page.locator('#mOpts .msel').first().click();
  const pinned = await page.evaluate(() => S.towers[0].mutSel);
  expect(pinned).toBeTruthy();
  await page.locator('#pMax').click();
  const t = await page.evaluate(() => ({ lv:S.towers[0].lv, muts:S.towers[0].muts, draftOpen:!!ui.mutT }));
  expect(t.draftOpen).toBe(false);
  expect(t.muts.length).toBe(Math.floor(t.lv / 5));
  expect(t.muts.every(m => m === pinned)).toBe(true);
});

test('inspector buttons stay inside the panel with many mutations', async () => {
  await newSave();
  const tile = await freeTile();
  await page.evaluate(({ x, y }) => {
    S.gold = 1e15; place(1, x, y);
    const t = S.towers[0]; t.mutSel = MUTS[TOWERS[t.type].id][0].id; upgradeMax(t); openPanel(t);
  }, tile);
  const outside = await page.evaluate(() => {
    const panel = document.getElementById('panel').getBoundingClientRect();
    return [...document.querySelectorAll('#panel > .ph, #panel > .uprow, #panel > .prow, #panel .btn')]
      .filter(e => e.offsetParent)
      .filter(e => { const r = e.getBoundingClientRect(); return r.bottom > panel.bottom + .5 || r.right > panel.right + .5; })
      .map(e => e.id || e.className);
  });
  expect(outside).toEqual([]);
});

test('selecting any economy tower keeps the race running', async () => {
  await newSave();
  for (const id of ['mint', 'wind', 'pit', 'solar']) {
    const t0 = await page.evaluate(id => {
      for (const t of [...S.towers]) sell(t);
      S.prestige = 3; S.gold = 1e9;
      for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (!isPath(x, y) && !S.towers.length) place(TOWER_INDEX[id], x, y);
      if (id === 'mint') S.towers[0].muts = ['mint_merch'];
      openPanel(S.towers[0]);
      return S.time;
    }, id);
    await page.waitForFunction(t0 => S.time > t0 + 0.2, t0);
  }
});

test('home screen can be moved and resized from every edge, at any zoom', async () => {
  await page.setViewportSize({ width:1400, height:1100 }); // room for the widget at 2.5x
  for (const scale of [1, 2.5]) {
    await page.evaluate(s => { applyScale(s); setAnchor('l', 't'); ui.pos = { dx:10, dy:10 }; placeInPage(); }, scale);
    const bb = await page.locator('#w').boundingBox();
    const hits = await page.evaluate(({ x, y, w, h }) => {
      const at = (px, py) => { const e = document.elementFromPoint(px, py); return e.closest('.rz') ? e.closest('.rz').dataset.dir : e.closest('.handle') ? 'drag' : 'none'; };
      const L = x + .5, R = x + w - .5, T = y + .5, B = y + h - .5, cx = x + w / 2, cy = y + h / 2;
      return { w:at(L, cy), e:at(R, cy), n:at(cx, T), s:at(cx, B), nw:at(L, T), ne:at(R, T), sw:at(L, B), se:at(R, B) };
    }, { x:bb.x, y:bb.y, w:bb.width, h:bb.height });
    expect(hits).toEqual({ w:'w', e:'e', n:'n', s:'s', nw:'nw', ne:'ne', sw:'sw', se:'se' });
    await expect(page.locator('#home .hm-ttl.handle')).toBeVisible();
  }
});
