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
pipeline. Generated files land here; the catalog pipeline itself is not part
of this repository. The one exception is the small update detector in
`scripts/` (see below), which runs here as a GitHub Action.

## Layout

```
data/            Master catalog (English names, all structural data)
  items.json     Every item: one flat record per object, keyed by uniqueName
  drops/         Drop tables: missions, relics, enemies
  polarities.json  Community-corrected mod polarities
  ducats.json    Ducat values
  updates.json   Items each Warframe update added (the apps' "New" strip)
  known-items.json  Detector baseline: every uniqueName seen so far
i18n/            App and web UI strings per language (community-editable)
  locales/       One directory per language, each with a ui.json
schema/          JSON Schemas documenting every data file's format
scripts/         detect-updates.mjs — finds new items in DE's Public Export
ocr/             OCR runtime binaries for the Overwolf app (ONNX + tessdata);
                 downloaded on first warm-up — see ocr/README.md
```

## Update detection

`.github/workflows/detect-updates.yml` runs `scripts/detect-updates.mjs`
every 6 hours (or by hand from the Actions tab). When DE's Public Export adds
Warframes, weapons or companions, it opens a pull request with a new entry at
the top of `data/updates.json` whose `version` and `name` are `TODO`. Set
them (titles and dates: <https://www.warframe.com/updates>), move hotfix items
into their main update's entry, and merge — the validate check rejects any
remaining `TODO`. To run it locally instead:

```bash
node scripts/detect-updates.mjs              # detect and write data/
node scripts/detect-updates.mjs --baseline   # rebuild known-items.json only
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