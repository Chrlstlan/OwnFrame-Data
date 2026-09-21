# OwnFrame-Items

OwnFrame's Warframe item database: a structured master catalog of every item in
the game, per-locale name overlays, and community-curated datasets (polarities,
ducats, drop data).

The catalog is derived from Digital Extremes' official Public Export files and
the official drop tables — see [NOTICE.md](NOTICE.md) for sources and
attribution.

## Status

This repository is being set up. The directory layout below is the target
structure; `data/` and `locales/` are being populated by the existing
OwnFrame data pipeline.

## Planned layout

```
data/            Master catalog (English names, all structural data)
  items.json     Every item: one flat record per object, keyed by uniqueName
  drops/         Drop tables: missions, relics, enemies
  polarities.json  Community-corrected mod polarities
  ducats.json    Ducat values
locales/         Per-language name overlays, keyed by uniqueName
schema/          JSON Schemas documenting every data file's format
scripts/         Pipeline: fetch official exports, build, validate
```

## How the data is shaped

Every item is a single flat record. Items reference each other exclusively via
`uniqueName` (e.g. a Warframe's `craftedFrom` points at the Blueprint item that
produces it). There is no nesting between records.

Optional fields appear only where they make sense for the item's category
(`stats` on Warframes and weapons, `recipe` on craftable items, `relicRewards`
on relics, …).

## Consuming the data

Four ways to consume, pick what fits your project:

1. **npm package** — `@ownframe/items` (workspace package; publishes later)
2. **Raw URL** — point at `data/*.json` on `raw.githubusercontent.com`
3. **Pinned release** — tag releases so your app never sees silent data drift
4. **Clone + build** — run the pipeline yourself against the official sources

## Contributing

Found a wrong polarity, a missing item, or a bad translation? See
[CONTRIBUTING.md](CONTRIBUTING.md) — most fixes are a single-file pull request.