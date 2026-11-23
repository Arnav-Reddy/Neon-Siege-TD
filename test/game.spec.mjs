import { test, expect } from '@playwright/test';

// Save fixtures are staged on an already-loaded page, then that page is closed
// with Playwright's default page.close(). Do not replace this with page.reload():
// the default close does not fire beforeunload, so the game's save-on-unload
// handler cannot overwrite the fixture before the next page reads it.

let context;
let page;
let pageErrors;

async function openGame(targetPage) {
  await targetPage.goto('/');
  await targetPage.waitForFunction(() => typeof S === 'object' && S !== null);
}

test.beforeEach(async ({ context: freshContext, page: freshPage }) => {
  // Playwright creates these fixtures afresh for every test, isolating storage.
  context = freshContext;
  page = freshPage;
  pageErrors = [];

  const collectErrors = p => p.on('pageerror', error => pageErrors.push(error.message));
  context.on('page', collectErrors);
  collectErrors(page);
  await openGame(page);
});

test.afterEach(() => {
  expect(pageErrors, 'no uncaught page errors').toEqual([]);
});

test('loads clean', async () => {
  await expect(page.locator('#sWave')).toHaveText('0');
  await expect(page.locator('#sGold')).toHaveText('100');
  const widget = await page.locator('#w').boundingBox();
  expect(widget).not.toBeNull();
  expect(widget.width).toBe(420);
  expect(widget.height).toBe(400);
});

test('place tower through dock and canvas mouse input', async () => {
  const goldBefore = await page.evaluate(() => S.gold);
  await page.locator('.tw').first().click();
  const point = await page.evaluate(() => {
    let tile;
    for (let y = 0; y < ROWS && !tile; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isPath(x, y) && !towerAt(x, y)) {
          tile = { x, y };
          break;
        }
      }
    }
    if (!tile) throw new Error('No free non-path tile');
    const rect = document.getElementById('cv').getBoundingClientRect();
    return {
      x: rect.left + (tile.x + 0.5) * rect.width / COLS,
      y: rect.top + (tile.y + 0.5) * rect.height / ROWS,
    };
  });
  await page.mouse.click(point.x, point.y);

  const placed = await page.evaluate(() => ({ gold: S.gold, towers: S.towers.length }));
  expect(placed.gold).toBe(goldBefore - 25);
  expect(placed.towers).toBe(1);
});

test('start wave spawns enemies and advances wave state', async () => {
  const state = await page.evaluate(() => {
    startWave();
    for (let i = 0; i < 600 && S.enemies.length === 0; i++) update(STEP);
    return { waveActive: S.waveActive, wave: S.wave, enemies: S.enemies.length };
  });
  expect(state.waveActive).toBe(true);
  expect(state.wave).toBe(1);
  expect(state.enemies).toBeGreaterThan(0);
});

test('C1: corrupt save is backed up and recovered as a fresh run', async () => {
  await page.evaluate(() => localStorage.setItem('neonSiegeTD.v2', '{not json'));
  await page.close();

  page = await context.newPage();
  await openGame(page);
  const recovered = await page.evaluate(() => ({
    wave: S.wave,
    gold: S.gold,
    backup: localStorage.getItem('neonSiegeTD.v2.corrupt'),
    banner: S.banner?.s || '',
  }));
  expect(recovered.wave).toBe(0);
  expect(recovered.gold).toBe(100);
  expect(recovered.backup).toBe('{not json');
  expect(recovered.banner).toMatch(/UNREADABLE/);
});

test('C1: unknown tower ids are skipped without losing valid state', async () => {
  await page.evaluate(() => {
    const tower = (id, x) => ({ id, x, y:0, lv:1, kills:0, earned:0, muts:[], invested:25 });
    localStorage.setItem('neonSiegeTD.v2', JSON.stringify({
      v:2, seed:12345, gold:777, lives:20, wave:4, prestige:0, catalysts:0,
      best:4, bossKills:0, runEarned:0, ascensions:0, bossCP:0,
      speed:1, auto:false, autoMut:false, min:false, waveActive:false, waveSnap:null,
      scale:1, place:{ ax:'r', ay:'b', dx:16, dy:16 },
      towers:[tower('nope', 2), tower('bolt', 4)],
    }));
  });
  await page.close();

  page = await context.newPage();
  await openGame(page);
  const recovered = await page.evaluate(() => ({
    gold:S.gold,
    wave:S.wave,
    towerIds:S.towers.map(t => TOWERS[t.type].id),
  }));
  expect(recovered.towerIds).toEqual(['bolt']);
  expect(recovered.gold).toBe(777);
  expect(recovered.wave).toBe(4);
});

test('R1: mid-wave load rolls back rewards and restarts the wave', async () => {
  const result = await page.evaluate(() => {
    newMap(0);
    S.gold = 1e5;
    let tile;
    for (let y = 0; y < ROWS && !tile; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isPath(x, y) && !towerAt(x, y)) { tile = { x, y }; break; }
      }
    }
    place(0, tile.x, tile.y);
    startWave();
    for (let i = 0; i < 600 && S.enemies.length === 0; i++) update(STEP);
    for (let i = 0; i < 60; i++) update(STEP);
    const midWave = { wave:S.wave, gold:S.gold };
    save();
    load();
    return {
      midWave,
      wave:S.wave,
      gold:S.gold,
      enemies:S.enemies.length,
      waveActive:S.waveActive,
      banner:S.banner?.s || '',
    };
  });
  expect(result.wave).toBe(result.midWave.wave - 1);
  expect(result.gold).toBe(99975);
  expect(result.enemies).toBe(0);
  expect(result.waveActive).toBe(false);
  expect(result.banner).toMatch(/RESTARTED/);
});

test('R2: pending mutation blocks prestige and newMap clears the lock', async () => {
  const result = await page.evaluate(() => {
    newMap(0);
    let tile;
    for (let y = 0; y < ROWS && !tile; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isPath(x, y)) { tile = { x, y }; break; }
      }
    }
    place(0, tile.x, tile.y);
    const t = S.towers[0];
    t.lv = 5;
    t.muts = ['range'];
    openMut(t);
    openPrestige();
    const blocked = {
      hidden:document.getElementById('pres').classList.contains('hidden'),
      prestigeOpen:ui.pres,
      banner:S.banner?.s || '',
    };
    newMap(0);
    const mutationAfterNewMap = ui.mutT;
    openPrestige();
    return { blocked, mutationAfterNewMap, prestigeAfterNewMap:ui.pres };
  });
  expect(result.blocked.hidden).toBe(true);
  expect(result.blocked.prestigeOpen).toBe(false);
  expect(result.blocked.banner).toMatch(/MUTATION/);
  expect(result.mutationAfterNewMap).toBeNull();
  expect(result.prestigeAfterNewMap).toBe(true);
});

test('R3: prestige pauses simulation and blocks Space hotkey', async () => {
  const paused = await page.evaluate(async () => {
    openPrestige();
    const before = S.time;
    await new Promise(resolve => setTimeout(resolve, 400));
    return { before, after:S.time, open:ui.pres };
  });
  expect(paused.open).toBe(true);
  expect(paused.after).toBe(paused.before);

  await page.keyboard.press('Space');
  const behindOverlay = await page.evaluate(() => ({ wave:S.wave, waveActive:S.waveActive }));
  expect(behindOverlay).toEqual({ wave:0, waveActive:false });
  await page.evaluate(() => closePrestige());
});

test('R7: catch-up drains and advances simulation time', async () => {
  const result = await page.evaluate(async () => {
    ui.catchup = 2;
    const before = S.time;
    await new Promise(resolve => setTimeout(resolve, 600));
    return { elapsed:S.time - before, catchup:ui.catchup };
  });
  expect(result.elapsed).toBeGreaterThanOrEqual(2);
  expect(result.catchup).toBeLessThan(0.001);
});

test('save then load preserves wave, gold, and towers', async () => {
  const result = await page.evaluate(() => {
    newMap(0);
    S.gold = 4321;
    S.wave = 7;
    let tile;
    for (let y = 0; y < ROWS && !tile; y++) {
      for (let x = 0; x < COLS; x++) {
        if (!isPath(x, y)) { tile = { x, y }; break; }
      }
    }
    place(0, tile.x, tile.y);
    save();
    const before = { wave:S.wave, gold:S.gold, towers:S.towers.map(towerDTO) };
    load();
    return { before, after:{ wave:S.wave, gold:S.gold, towers:S.towers.map(towerDTO) } };
  });
  expect(result.after).toEqual(result.before);
});
