import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../voice-recorder.html', import.meta.url), 'utf8');
const script = html.slice(html.indexOf('<script>') + '<script>'.length, html.lastIndexOf('</script>'));

test('voice recorder keeps captured audio local until an explicit export', () => {
  assert.match(html, /录音仅留在当前设备，不会自动上传/);
  assert.match(html, /页面不会把声音传到服务器/);
  assert.doesNotMatch(script, /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
});

test('voice recorder requires adult and informed collection confirmation', () => {
  assert.match(html, /id="adultConsent"/);
  assert.match(html, /id="voiceConsent"/);
  assert.match(html, /公开发布、商业使用、训练或合成音色需另行书面授权/);
});

test('voice recorder offers balanced Chinese and Thai audition scripts', () => {
  assert.equal((script.match(/id: 'zh-\d{2}'/g) || []).length, 16);
  assert.equal((script.match(/id: 'th-\d{2}'/g) || []).length, 16);
  assert.match(html, /不会标准泰语就选“只录中文”/);
});

test('voice recorder exports one zip with matching audio manifest paths', () => {
  assert.match(script, /file: `audio\/\$\{prompt\.id\}/);
  assert.match(script, /files\.push\(\{ name: `audio\/\$\{prompt\.id\}/);
  assert.match(script, /type: 'application\/zip'/);
});

test('recording pulse does not move the stop button hit target', () => {
  const pulse = html.match(/@keyframes pulse\s*\{([^}]+)\}/)?.[1] || '';
  assert.doesNotMatch(pulse, /transform\s*:/);
  assert.match(html, /\.record-main\s*\{[\s\S]*?min-height:\s*64px/);
});
