# schema/

JSON Schemas for every data file in this repository.

CI validates every pull request against the matching schema, so contributors
get immediate feedback on format errors without having to understand the
pipeline.

| Schema | Validates |
|---|---|
| `polarity.schema.json` | `data/polarities.json` |
| `ducats.schema.json` | `data/ducats.json` |
| `ui.schema.json` | `i18n/locales/<lang>/ui.json` |
| `item.schema.json` | `data/items.json` (added when the catalog lands) |

Schemas also serve as the format documentation — each field carries a
description. Start reading at the schema for the file you want to consume.

Keys prefixed with `_` (e.g. `_comment`) are file metadata, not data entries —
the schemas accept them separately.