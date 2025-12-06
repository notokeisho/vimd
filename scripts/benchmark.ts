/**
 * vimd v0.2.0 Performance Benchmark Script
 *
 * Measures conversion time for pandoc parser as baseline.
 * Will be extended to measure markdown-it parser after implementation.
 *
 * Usage:
 *   npx tsx scripts/benchmark.ts
 */

import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SAMPLE_DIR = path.join(__dirname, 'benchmark-samples');
const ITERATIONS = 5; // Number of iterations for averaging

interface BenchmarkResult {
  file: string;
  lines: number;
  times: number[];
  average: number;
  min: number;
  max: number;
}

/**
 * Measure pandoc conversion time for a single file
 */
function measurePandocConversion(filePath: string): number {
  const start = performance.now();

  execSync(`pandoc --from=markdown --to=html "${filePath}"`, {
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const end = performance.now();
  return end - start;
}

/**
 * Count lines in a file
 */
function countLines(filePath: string): number {
  const content = fs.readFileSync(filePath, 'utf-8');
  return content.split('\n').length;
}

/**
 * Run benchmark for a single sample file
 */
function benchmarkFile(filePath: string): BenchmarkResult {
  const fileName = path.basename(filePath);
  const lines = countLines(filePath);
  const times: number[] = [];

  // Warm-up run (not counted)
  measurePandocConversion(filePath);

  // Measured runs
  for (let i = 0; i < ITERATIONS; i++) {
    const time = measurePandocConversion(filePath);
    times.push(time);
  }

  const average = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  return {
    file: fileName,
    lines,
    times,
    average,
    min,
    max,
  };
}

/**
 * Check if pandoc is installed
 */
function checkPandoc(): boolean {
  try {
    execSync('pandoc --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Format time in milliseconds
 */
function formatMs(ms: number): string {
  return `${ms.toFixed(2)}ms`;
}

/**
 * Main benchmark function
 */
async function runBenchmark(): Promise<void> {
  console.log('='.repeat(60));
  console.log('vimd v0.2.0 Performance Benchmark');
  console.log('='.repeat(60));
  console.log();

  // Check pandoc installation
  if (!checkPandoc()) {
    console.error('Error: pandoc is not installed.');
    console.error('Please install pandoc to run this benchmark.');
    process.exit(1);
  }

  // Check sample directory
  if (!fs.existsSync(SAMPLE_DIR)) {
    console.error(`Error: Sample directory not found: ${SAMPLE_DIR}`);
    console.error('Please create sample files first.');
    console.error('Run: npx tsx scripts/create-samples.ts');
    process.exit(1);
  }

  // Get sample files
  const sampleFiles = fs
    .readdirSync(SAMPLE_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort((a, b) => {
      // Sort by number in filename (sample-100.md, sample-500.md, etc.)
      const numA = parseInt(a.match(/\d+/)?.[0] || '0');
      const numB = parseInt(b.match(/\d+/)?.[0] || '0');
      return numA - numB;
    })
    .map((f) => path.join(SAMPLE_DIR, f));

  if (sampleFiles.length === 0) {
    console.error('Error: No sample files found.');
    console.error('Please create sample files first.');
    process.exit(1);
  }

  console.log(`Found ${sampleFiles.length} sample file(s)`);
  console.log(`Running ${ITERATIONS} iterations per file`);
  console.log();

  // Run benchmarks
  const results: BenchmarkResult[] = [];

  for (const file of sampleFiles) {
    console.log(`Benchmarking: ${path.basename(file)}...`);
    const result = benchmarkFile(file);
    results.push(result);
    console.log(`  Average: ${formatMs(result.average)}`);
  }

  console.log();
  console.log('='.repeat(60));
  console.log('Results Summary (pandoc)');
  console.log('='.repeat(60));
  console.log();

  // Print table header
  console.log('| File | Lines | Average | Min | Max |');
  console.log('|------|-------|---------|-----|-----|');

  // Print results
  for (const result of results) {
    console.log(
      `| ${result.file} | ${result.lines} | ${formatMs(result.average)} | ${formatMs(result.min)} | ${formatMs(result.max)} |`
    );
  }

  console.log();

  // Generate markdown report
  const reportPath = path.join(__dirname, '../claudedocs/v0.2.0/benchmark-baseline.md');
  const reportDir = path.dirname(reportPath);

  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const reportContent = generateMarkdownReport(results);
  fs.writeFileSync(reportPath, reportContent, 'utf-8');
  console.log(`Report saved to: ${reportPath}`);
}

/**
 * Generate markdown report
 */
function generateMarkdownReport(results: BenchmarkResult[]): string {
  const now = new Date().toISOString().split('T')[0];

  let report = `# vimd v0.2.0 ベースライン計測結果

計測日: ${now}
計測環境: ${process.platform} ${process.arch}
Node.js: ${process.version}
繰り返し回数: ${ITERATIONS}

---

## ベースライン計測結果 (pandoc)

| ファイル | 行数 | 平均時間 | 最小 | 最大 |
|---------|------|---------|------|------|
`;

  for (const result of results) {
    report += `| ${result.file} | ${result.lines} | ${formatMs(result.average)} | ${formatMs(result.min)} | ${formatMs(result.max)} |\n`;
  }

  report += `
---

## 詳細データ

`;

  for (const result of results) {
    report += `### ${result.file}\n\n`;
    report += `- 行数: ${result.lines}\n`;
    report += `- 平均: ${formatMs(result.average)}\n`;
    report += `- 最小: ${formatMs(result.min)}\n`;
    report += `- 最大: ${formatMs(result.max)}\n`;
    report += `- 各回の測定値: ${result.times.map((t) => formatMs(t)).join(', ')}\n`;
    report += '\n';
  }

  report += `---

## 備考

- ウォームアップとして1回目の実行は計測から除外
- pandoc の変換時間のみを計測 (ファイル読み込み・書き込みは含まない)
- markdown-it 導入後に同じ条件で再計測し、比較する予定
`;

  return report;
}

// Run benchmark
runBenchmark().catch((error) => {
  console.error('Benchmark failed:', error);
  process.exit(1);
});
