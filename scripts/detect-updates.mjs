// scripts/detect-updates.mjs — detects items a Warframe update added, straight from Digital
// Extremes' official Public Export (no community API).
//
// Flow: read DE's export index → skip when the Warframe/weapon/companion exports are unchanged
// (hashes in data/updates.json `_source`) → otherwise download them and diff every uniqueName
// against data/known-items.json → new Warframes, weapons and companions go into a new entry at
// the top of data/updates.json with version/name "TODO" and today's date. A human sets version
// and name (and merges hotfix items into their main update) in the pull request; the schema
// rejects "TODO", so an unnamed entry cannot be merged.
//
// Usage (from the repo root):
//   node scripts/detect-updates.mjs              Detect and write the files.
//   node scripts/detect-updates.mjs --baseline   (Re)build known-items.json from the current
//                                                exports without adding an update entry.
//
// Outputs: progress lines on stdout; in GitHub Actions `changed=true|false` and `new_items=<n>`
// in $GITHUB_OUTPUT. Exits non-zero on network or parse errors.

import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LZMA } from './vendor/lzma-decoder.js'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const UPDATES_FILE = path.join(root, 'data', 'updates.json')
const KNOWN_FILE = path.join(root, 'data', 'known-items.json')

const EXPORT_BASE = 'https://content.warframe.com/PublicExport'
const MAX_UPDATES = 10

/** Exports to diff, and the productCategory values that count as "new item" for the apps. */
const EXPORTS = {
  'ExportWarframes_en.json': new Set(['Suits', 'SpaceSuits', 'MechSuits']),
  'ExportWeapons_en.json': new Set([
    'LongGuns',
    'Pistols',
    'Melee',
    'SpaceGuns',
    'SpaceMelee',
    'OperatorAmps',
    'SentinelWeapons',
  ]),
  'ExportSentinels_en.json': null, // every companion counts
}

const baselineOnly = process.argv.includes('--baseline')

function readJson(file, fallback) {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`)
}

function setOutput(name, value) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`)
}

async function fetchOk(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`)
  return res
}

/** DE's index is LZMA "alone" with a size header standard decoders reject — hence LZMA-JS. */
async function loadIndex() {
  const res = await fetchOk(`${EXPORT_BASE}/index_en.txt.lzma`)
  const text = String(LZMA.decompress(new Uint8Array(await res.arrayBuffer())))
  const index = {}
  for (const line of text.split(/\r?\n/)) {
    const [file, hash] = line.trim().split('!')
    if (file && hash) index[file] = hash
  }
  return index
}

/** DE's export JSON contains raw control characters inside strings — strip them before parsing. */
async function loadExport(file, hash) {
  const res = await fetchOk(`${EXPORT_BASE}/Manifest/${file}!${hash}`)
  const json = JSON.parse((await res.text()).replace(/[\u0000-\u001f]/g, ' '))
  const list = Object.values(json).find(Array.isArray)
  if (!list) throw new Error(`${file}: no item array found`)
  return list
}

async function main() {
  const updates = readJson(UPDATES_FILE, { updates: [] })
  const known = readJson(KNOWN_FILE, { items: [] })

  const index = await loadIndex()
  const source = {}
  for (const file of Object.keys(EXPORTS)) {
    if (!index[file]) throw new Error(`${file} missing from the export index`)
    source[file] = index[file]
  }

  const unchanged = Object.keys(EXPORTS).every((file) => updates._source?.[file] === source[file])
  if (unchanged && !baselineOnly) {
    console.log('Public Export unchanged — nothing to do.')
    setOutput('changed', 'false')
    setOutput('new_items', '0')
    return
  }

  const knownSet = new Set(known.items)
  const allNames = new Set(knownSet)
  const newItems = []
  for (const [file, categories] of Object.entries(EXPORTS)) {
    for (const item of await loadExport(file, source[file])) {
      const name = item?.uniqueName
      if (typeof name !== 'string' || !name.startsWith('/Lotus/')) continue
      allNames.add(name)
      if (knownSet.has(name)) continue
      if (categories && !categories.has(item.productCategory)) continue
      newItems.push({ uniqueName: name, name: item.name, category: item.productCategory })
    }
  }

  known._comment ??=
    'Every Warframe, weapon and companion uniqueName the update detector has seen (scripts/detect-updates.mjs). Generated — do not edit by hand.'
  known.items = [...allNames].sort()
  updates._source = source

  if (!baselineOnly && newItems.length > 0) {
    newItems.sort((a, b) => a.uniqueName.localeCompare(b.uniqueName))
    updates.updates = [
      {
        version: 'TODO',
        name: 'TODO',
        date: new Date().toISOString().slice(0, 10),
        items: newItems.map((item) => item.uniqueName),
      },
      ...(updates.updates ?? []),
    ].slice(0, MAX_UPDATES)
    console.log(`${newItems.length} new item(s):`)
    for (const item of newItems) console.log(`  ${item.name} (${item.category}) — ${item.uniqueName}`)
  } else {
    console.log(baselineOnly ? 'Baseline rebuilt.' : 'Exports changed, but no new items.')
  }

  writeJson(KNOWN_FILE, known)
  writeJson(UPDATES_FILE, updates)
  setOutput('changed', String(newItems.length > 0 && !baselineOnly))
  setOutput('new_items', String(baselineOnly ? 0 : newItems.length))
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
