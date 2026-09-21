# Contributing

Found something wrong? Great — most fixes here are small, and each data file
tells you exactly what you can change. The key rule:

> **`data/items.json` and the files under `data/drops/` are pipeline-generated.
> Do not edit them by hand — your changes will be overwritten on the next
> refresh.** Everything under `locales/` and the curated datasets
> (`data/polarities.json`, `data/ducats.json`) is community-maintained and
> edit-safe.

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
| Bad or missing translation for language X | `locales/X/names.json` |
| Wrong item data (name, stats, recipe, drops) | open an issue — these come from the official exports and need a pipeline-level fix |

## Validation

`schema/` contains JSON Schemas for every data file. A CI job validates every
pull request against them — if your edit breaks the shape, the check will say
exactly which entry failed and why.

## Licensing

By contributing you agree your contribution is licensed under the same terms as
the file you edited (see [LICENSE.md](LICENSE.md)).