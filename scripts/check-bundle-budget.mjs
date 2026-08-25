import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { gzipSync } from 'node:zlib';

const distDir = path.resolve(process.cwd(), 'dist');
const htmlPath = path.join(distDir, 'index.html');
const html = readFileSync(htmlPath, 'utf8');

function assetFromHtml(pattern, label) {
  const match = html.match(pattern);
  if (!match?.[1]) throw new Error(`Bundle budget: không tìm thấy ${label} trong dist/index.html.`);
  return path.join(distDir, 'assets', match[1]);
}

function gzipBytes(filePath) {
  return gzipSync(readFileSync(filePath)).byteLength;
}

function assertBudget(label, actual, limit) {
  if (actual > limit) {
    throw new Error(`Bundle budget exceeded: ${label} ${actual} bytes > ${limit} bytes.`);
  }
}

const entryPath = assetFromHtml(/<script[^>]+src="[^"]*\/assets\/(index-[^"]+\.js)"[^>]*>/i, 'entry JavaScript');
const cssPath = assetFromHtml(/<link[^>]+href="[^"]*\/assets\/(index-[^"]+\.css)"[^>]*>/i, 'entry CSS');

const entryRaw = statSync(entryPath).size;
const entryGzip = gzipBytes(entryPath);
const cssRaw = statSync(cssPath).size;
const cssGzip = gzipBytes(cssPath);

assertBudget('entry JS gzip', entryGzip, 20 * 1024);
assertBudget('entry CSS gzip', cssGzip, 50 * 1024);

if (html.includes('vendor-motion')) {
  throw new Error('Bundle budget: vendor-motion must not be preloaded on the initial document.');
}

process.stdout.write(`[bundle-budget] entry JS ${(entryRaw / 1024).toFixed(2)} KiB raw / ${(entryGzip / 1024).toFixed(2)} KiB gzip\n`);
process.stdout.write(`[bundle-budget] entry CSS ${(cssRaw / 1024).toFixed(2)} KiB raw / ${(cssGzip / 1024).toFixed(2)} KiB gzip\n`);
process.stdout.write('[bundle-budget] initial document does not preload vendor-motion\n');
