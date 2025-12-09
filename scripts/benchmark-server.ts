/**
 * vimd v0.3.0 Server Performance Benchmark
 *
 * Measures:
 * 1. Server startup time (WebSocketServer)
 * 2. Broadcast latency (time to send reload message)
 *
 * Usage:
 *   npx tsx scripts/benchmark-server.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { fileURLToPath } from 'url';
import { WebSocketServer } from '../src/core/websocket-server.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ITERATIONS = 10;

interface BenchmarkResult {
  metric: string;
  times: number[];
  average: number;
  min: number;
  max: number;
}

function formatMs(ms: number): string {
  return `${ms.toFixed(2)}ms`;
}

async function measureServerStartup(testDir: string): Promise<number> {
  const start = performance.now();

  const server = new WebSocketServer({
    port: 39100 + Math.floor(Math.random() * 100),
    root: testDir,
  });

  await server.start();
  const end = performance.now();

  await server.stop();

  return end - start;
}

async function measureBroadcastLatency(
  server: WebSocketServer
): Promise<number> {
  const start = performance.now();
  server.broadcast('reload');
  const end = performance.now();
  return end - start;
}

async function runBenchmark(): Promise<void> {
  console.log('='.repeat(60));
  console.log('vimd v0.3.0 Server Performance Benchmark');
  console.log('='.repeat(60));
  console.log();

  // Create temp directory
  const testDir = path.join(os.tmpdir(), 'vimd-benchmark-test');
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Create a test HTML file
  fs.writeFileSync(
    path.join(testDir, 'test.html'),
    '<!DOCTYPE html><html><body>Test</body></html>'
  );

  const results: BenchmarkResult[] = [];

  // 1. Measure server startup time
  console.log('Measuring server startup time...');
  const startupTimes: number[] = [];

  for (let i = 0; i < ITERATIONS; i++) {
    const time = await measureServerStartup(testDir);
    startupTimes.push(time);
    process.stdout.write('.');
  }
  console.log(' done');

  const startupResult: BenchmarkResult = {
    metric: 'Server Startup',
    times: startupTimes,
    average: startupTimes.reduce((a, b) => a + b, 0) / startupTimes.length,
    min: Math.min(...startupTimes),
    max: Math.max(...startupTimes),
  };
  results.push(startupResult);

  // 2. Measure broadcast latency
  console.log('Measuring broadcast latency...');
  const broadcastTimes: number[] = [];

  const server = new WebSocketServer({
    port: 39200,
    root: testDir,
  });
  await server.start();

  for (let i = 0; i < ITERATIONS; i++) {
    const time = await measureBroadcastLatency(server);
    broadcastTimes.push(time);
    process.stdout.write('.');
  }
  console.log(' done');

  await server.stop();

  const broadcastResult: BenchmarkResult = {
    metric: 'Broadcast Latency',
    times: broadcastTimes,
    average: broadcastTimes.reduce((a, b) => a + b, 0) / broadcastTimes.length,
    min: Math.min(...broadcastTimes),
    max: Math.max(...broadcastTimes),
  };
  results.push(broadcastResult);

  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });

  // Print results
  console.log();
  console.log('='.repeat(60));
  console.log('Results Summary (WebSocketServer)');
  console.log('='.repeat(60));
  console.log();

  console.log('| Metric | Average | Min | Max |');
  console.log('|--------|---------|-----|-----|');

  for (const result of results) {
    console.log(
      `| ${result.metric} | ${formatMs(result.average)} | ${formatMs(result.min)} | ${formatMs(result.max)} |`
    );
  }

  console.log();

  // Bundle size comparison
  console.log('='.repeat(60));
  console.log('Bundle Size Comparison');
  console.log('='.repeat(60));
  console.log();
  console.log('| Package | Size |');
  console.log('|---------|------|');
  console.log('| live-server (v0.2.x) | 1.7MB |');
  console.log('| ws + polka + sirv (v0.3.0) | 284KB |');
  console.log('| **Reduction** | **-83%** |');
  console.log();

  // Generate report
  const reportPath = path.join(
    __dirname,
    '../claudedocs/v0.3.0/benchmark-server.md'
  );
  const reportContent = generateReport(results);
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`Report saved to: ${reportPath}`);
}

function generateReport(results: BenchmarkResult[]): string {
  const now = new Date().toISOString().split('T')[0];

  return `# vimd v0.3.0 サーバーパフォーマンス計測結果

計測日: ${now}
計測環境: ${process.platform} ${process.arch}
Node.js: ${process.version}
繰り返し回数: ${ITERATIONS}

---

## サーバーパフォーマンス

| 指標 | 平均 | 最小 | 最大 |
|------|------|------|------|
${results.map((r) => `| ${r.metric} | ${formatMs(r.average)} | ${formatMs(r.min)} | ${formatMs(r.max)} |`).join('\n')}

---

## バンドルサイズ比較

| パッケージ | サイズ |
|-----------|--------|
| live-server (v0.2.x) | 1.7MB |
| ws + polka + sirv (v0.3.0) | 284KB |
| **削減率** | **-83%** |

---

## 詳細データ

${results.map((r) => `### ${r.metric}

- 平均: ${formatMs(r.average)}
- 最小: ${formatMs(r.min)}
- 最大: ${formatMs(r.max)}
- 各回の測定値: ${r.times.map((t) => formatMs(t)).join(', ')}
`).join('\n')}

---

## 備考

- サーバー起動時間: WebSocketServer.start() の完了までの時間
- ブロードキャストレイテンシ: broadcast('reload') の呼び出し時間
- 実際のブラウザリロード時間はネットワーク・ブラウザ依存
`;
}

runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
