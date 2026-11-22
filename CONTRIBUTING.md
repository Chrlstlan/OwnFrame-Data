# Contributing

Found something wrong? Great — most fixes here are small, and each data file
tells you exactly what you can change. The key rule:

> **`data/items.json` and the files under `data/drops/` are pipeline-generated.
> Do not edit them by hand — your changes will be overwritten on the next
> refresh.** Everything under `i18n/` and the curated datasets
> (`data/polarities.json`, `data/ducats.json`, `data/vendors/`,
> `data/syndicates/`) is community-maintained and edit-safe.

## Reporting an issue

Open an issue and include, where relevant:

- The item's `uniqueName` (that key makes every report unambiguous)
- What the game actually shows (screenshot helps a lot)
- Which language you saw it in, for translation reports

## Fixing it yourself

1. Fork, branch, edit the one file that owns the data (see table below).
2. Keep the existing file format — keys sorted the way they are in the file,
   same structure as the neighboring entries.
3. Open a pull request against `main`. A short description of where you saw
   the correct value in-game is enough as the PR body.

| Problem | File to edit |
|---|---|
| Wrong/missing mod polarity | `data/polarities.json` |
| Wrong/missing ducat value | `data/ducats.json` |
| Bad or awkward UI text in language X (buttons, labels, hints) | `i18n/locales/X/ui.json` |
| New vendor, or a vendor's offers/prices/required ranks are wrong or missing | `data/vendors/<vendor>.json` (new vendor: new file, see below) |
| Syndicate ranks, rank titles or standing caps | `data/syndicates/<syndicate>.json` |
| Wrong item data (name, stats, recipe, drops) | open an issue — these come from the official exports and need a pipeline-level fix |

## Vendors and syndicates

One file per vendor in `data/vendors/` and one per syndicate in `data/syndicates/`; the file
name is the `id` inside it. `schema/vendor.schema.json` and `schema/syndicate.schema.json`
describe every field. Items and currencies are catalog `uniqueName`s (`/Lotus/...`), so names,
images and every language come from the catalog. Don't know the `uniqueName`? Write the English
name as `"itemName"` instead of `"item"` — it gets resolved before merging:

```bash
node scripts/check-references.mjs --resolve --catalog=<path to an English All.json>
```

Vendors whose stock rotates in the game's world state (Baro Ki'Teer, Varzia) get no file.
Merged changes reach the OwnFrame app within about 15 minutes, without an app update.

## Validation

`schema/` contains JSON Schemas for every data file. A CI job validates every
pull request against them — if your edit breaks the shape, the check will say
exactly which entry failed and why.

## Licensing

By contributing you agree your contribution is licensed under the same terms as
the file you edited (see [LICENSE.md](LICENSE.md)).