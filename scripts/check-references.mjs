// scripts/check-references.mjs — cross-file checks for data/syndicates/ and data/vendors/
// that JSON Schema cannot express. Run after the schema validation (CI or locally).
//
// Usage (from the repo root):
//   node scripts/check-references.mjs             Check only.
//   node scripts/check-references.mjs --resolve   Also replace every unambiguous "itemName"
//                                                 with the catalog uniqueName and save the files.
//   --catalog=<path>                              Catalog to check against (default
//                                                 data/All.en.json), e.g. from outside the repo.
//                                                 Repeat it to resolve names in several languages
//                                                 (an English and a German All.json: "itemName"
//                                                 may then be "Narin Blaupause" as well).
//
// Errors (exit code 1): file name differs from `id`, a vendor or alignment points to an
// unknown syndicate, an item or currency uniqueName is missing from data/All.en.json, a
// required rank does not exist in the syndicate's ranks, ranks are not ascending.
// Warnings (exit code 0): gaps still to fill — faction without alignments, an alignment the
// other side does not mirror, offers without price, rank titles without rank numbers,
// item names not resolved to a uniqueName yet.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const resolve = process.argv.includes('--resolve')
const errors = []
const warnings = []

/** Read every `<id>.json` in a data folder; returns `{ file, doc }` pairs. */
function readFolder(folder) {
  const dir = path.join(root, 'data', folder)
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith('.json'))
    .map((file) => ({
      file: `data/${folder}/${file}`,
      doc: JSON.parse(readFileSync(path.join(dir, file), 'utf8')),
    }))
}

const syndicates = readFolder('syndicates')
const vendors = readFolder('vendors')

const catalogArgs = process.argv.filter((arg) => arg.startsWith('--catalog='))
const catalogPaths = (
  catalogArgs.length > 0
    ? catalogArgs.map((arg) => path.resolve(arg.slice('--catalog='.length)))
    : [path.join(root, 'data', 'All.en.json')]
).filter((catalogPath) => existsSync(catalogPath))
const catalogs = catalogPaths.map(
  (catalogPath) => JSON.parse(readFileSync(catalogPath, 'utf8')).items,
)
const catalog = catalogs.length > 0 ? catalogs.flat() : null
const knownItems = catalog ? new Set(catalog.map((item) => item.uniqueName)) : null
/** Catalog name in any loaded language (lowercased) → every distinct uniqueName carrying it. */
const byName = new Map()
for (const item of catalog ?? []) {
  const key = (item.name ?? '').toLowerCase()
  if (!byName.has(key)) byName.set(key, new Set())
  byName.get(key).add(item.uniqueName)
}
if (!catalog)
  warnings.push('data/All.en.json not found — uniqueNames and item names were not checked')

/** uniqueName for an item name (any loaded language), or the reason it cannot be resolved. */
function lookup(name) {
  const matches = [...(byName.get(name.toLowerCase()) ?? [])]
  if (matches.length === 1) return { uniqueName: matches[0] }
  if (matches.length === 0) return { reason: 'not in the catalog' }
  return { reason: `${matches.length} matches: ${matches.slice(0, 3).join(', ')}` }
}

/** True when a uniqueName-shaped value is missing from the catalog. */
const unknownUniqueName = (value) =>
  Boolean(knownItems && value?.startsWith('/Lotus/') && !knownItems.has(value))

/**
 * Resolve (with --resolve) or report the itemName stand-ins of one file. Entries of the item
 * lists (offers, standing trades) get `item`, costs get `currency`; both keep their key order
 * with the resolved field first. Returns true when the document changed.
 */
function handleItemNames(file, costLists, itemLists) {
  let changed = false
  const check = (name, apply) => {
    const found = catalog ? lookup(name) : { reason: 'catalog missing' }
    if (resolve && found.uniqueName) {
      apply(found.uniqueName)
      changed = true
    } else {
      warnings.push(
        `${file}: item name "${name}" not resolved yet (${found.reason ?? 'run --resolve'})`,
      )
    }
  }
  for (const entries of itemLists) {
    entries.forEach((entry, index) => {
      if (entry.itemName && !entry.item) {
        check(entry.itemName, (uniqueName) => {
          const { itemName: _name, ...rest } = entry
          entries[index] = { item: uniqueName, ...rest }
        })
      }
    })
  }
  for (const costs of costLists) {
    costs.forEach((cost, index) => {
      if (cost.itemName && !cost.currency) {
        check(cost.itemName, (uniqueName) => {
          costs[index] = { currency: uniqueName, amount: cost.amount }
        })
      }
    })
  }
  return changed
}

for (const { file, doc } of [...syndicates, ...vendors]) {
  if (path.basename(file, '.json') !== doc.id)
    errors.push(`${file}: id "${doc.id}" does not match the file name`)
  const costLists = [
    ...(doc.ranks ?? []).map((rank) => rank.rankUp?.cost ?? []),
    ...(doc.offers ?? []).map((offer) => offer.price ?? []),
  ]
  if (handleItemNames(file, costLists, [doc.offers ?? [], doc.standingTrades ?? []])) {
    writeFileSync(path.join(root, file), JSON.stringify(doc, null, 2) + '\n')
    console.log(`resolved item names in ${file}`)
  }
}

const syndicateById = new Map(syndicates.map(({ doc }) => [doc.id, doc]))

for (const { file, doc } of syndicates) {
  if (doc.group === 'faction' && !doc.alignments)
    warnings.push(`${file}: faction without alignments`)
  for (const [otherId, relation] of Object.entries(doc.alignments ?? {})) {
    const other = syndicateById.get(otherId)
    if (!other) errors.push(`${file}: alignment to unknown syndicate "${otherId}"`)
    else if (other.group !== 'faction')
      errors.push(`${file}: alignment to non-faction syndicate "${otherId}"`)
    else if (other.alignments?.[doc.id] !== relation)
      warnings.push(`${file}: "${otherId}" does not mirror the "${relation}" relation`)
  }
  const numbers = (doc.ranks ?? []).map((rank) => rank.rank)
  if (numbers.some((n, i) => i > 0 && n <= numbers[i - 1]))
    errors.push(`${file}: ranks are not in ascending order`)
  if (!doc.ranks) warnings.push(`${file}: no ranks yet`)
  for (const rank of doc.ranks ?? []) {
    for (const cost of rank.rankUp?.cost ?? []) {
      if (unknownUniqueName(cost.currency))
        errors.push(`${file}: rank ${rank.rank} costs unknown uniqueName ${cost.currency}`)
    }
  }
  for (const trade of doc.standingTrades ?? []) {
    if (unknownUniqueName(trade.item))
      errors.push(`${file}: standing trade with unknown uniqueName ${trade.item}`)
    if (trade.vendor && !vendors.some((vendor) => vendor.doc.id === trade.vendor))
      errors.push(`${file}: standing trade names unknown vendor "${trade.vendor}"`)
  }
}

for (const { file, doc } of vendors) {
  const syndicate = doc.syndicate ? syndicateById.get(doc.syndicate) : null
  if (doc.syndicate && !syndicate) errors.push(`${file}: unknown syndicate "${doc.syndicate}"`)
  const rankNumbers = new Set((syndicate?.ranks ?? []).map((rank) => rank.rank))
  for (const offer of doc.offers ?? []) {
    const label = offer.item ?? `"${offer.itemName}"`
    if (unknownUniqueName(offer.item)) errors.push(`${file}: unknown item uniqueName ${offer.item}`)
    if (!offer.price) warnings.push(`${file}: ${label} has no price yet`)
    for (const cost of offer.price ?? []) {
      if (unknownUniqueName(cost.currency))
        errors.push(`${file}: ${label} is paid with unknown uniqueName ${cost.currency}`)
    }
    const required = offer.requires?.rank
    if (required !== undefined && syndicate?.ranks && !rankNumbers.has(required))
      errors.push(
        `${file}: ${label} requires rank ${required}, which ${doc.syndicate} does not have`,
      )
    if (offer.requires?.rankTitle && required === undefined)
      warnings.push(
        `${file}: ${label} has rank title "${offer.requires.rankTitle}" but no rank number`,
      )
  }
}

for (const line of warnings) console.log(`warning  ${line}`)
for (const line of errors) console.error(`error    ${line}`)
console.log(
  `${syndicates.length} syndicates, ${vendors.length} vendors: ${errors.length} error(s), ${warnings.length} warning(s)`,
)
process.exit(errors.length > 0 ? 1 : 0)
