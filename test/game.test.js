import test from 'node:test';
import assert from 'node:assert/strict';
import { clamp, touching, step } from '../web/game.js';

test('체력은 0~100 범위를 유지한다', () => {
  assert.equal(clamp(-20, 0, 100), 0);
  assert.equal(clamp(120, 0, 100), 100);
  assert.equal(clamp(70, 0, 100), 70);
});

test('좀비와 닿으면 충돌로 판정한다', () => {
  const player = { x: 0, y: 0, r: 10 };
  assert.equal(touching(player, { x: 20, y: 0, r: 10 }), true);
  assert.equal(touching(player, { x: 21, y: 0, r: 10 }), false);
});

test('대각선 이동도 같은 속도를 유지한다', () => {
  const result = step(0, 0, 1, 1, 100, 1);
  assert.ok(Math.abs(Math.hypot(result.x, result.y) - 100) < 0.001);
});

test('입력이 없으면 움직이지 않는다', () => {
  assert.deepEqual(step(10, 20, 0, 0, 100, 1), { x: 10, y: 20 });
});
