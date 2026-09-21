# OwnFrame-Data

OwnFrame's public Warframe data: a structured master catalog of every item in
the game, drop data, community-curated datasets (polarities, ducats), and the
app/web UI strings in 15 languages — maintained by the OwnFrame team and
improved by the community.

The catalog is derived from Digital Extremes' official Public Export files and
the official drop tables — see [NOTICE.md](NOTICE.md) for sources and
attribution.

## Status

This repository is being set up. The layout below is the target structure;
`data/` and `i18n/` are being populated by the (private) OwnFrame data
pipeline. Generated files land here; the pipeline itself is not part of this
repository.

## Layout

```
data/            Master catalog (English names, all structural data)
  items.json     Every item: one flat record per object, keyed by uniqueName
  drops/         Drop tables: missions, relics, enemies
  polarities.json  Community-corrected mod polarities
  ducats.json    Ducat values
i18n/            App and web UI strings per language (community-editable)
  locales/       One directory per language, each with a ui.json
schema/          JSON Schemas documenting every data file's format
```

## How the data is shaped

Every item is a single flat record. Items reference each other exclusively via
`uniqueName` (e.g. a Warframe's `craftedFrom` points at the Blueprint item that
produces it). There is no nesting between records.

Optional fields appear only where they make sense for the item's category
(`stats` on Warframes and weapons, `recipe` on craftable items, `relicRewards`
on relics, …).

Item names in other languages are derived from the official localized exports
by the pipeline — they are not community-editable files in this repository.
What **is** community-editable here: the app and web **UI strings** under
`i18n/` (buttons, labels, hints — the surfaces, not the game data).

## Consuming the data

1. **npm package** — `@ownframe/data` (workspace package; publishes later)
2. **Raw URL** — point at `data/*.json` on `raw.githubusercontent.com`
3. **Pinned release** — tag releases so your app never sees silent data drift

## Contributing

Found a wrong polarity, a wrong UI string in your language, or a broken item?
See [CONTRIBUTING.md](CONTRIBUTING.md) — most fixes are a single-file pull
request or a one-line issue.