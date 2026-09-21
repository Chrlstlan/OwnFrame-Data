# schema/

JSON Schemas for every data file in this repository.

CI validates every pull request against the matching schema, so contributors
get immediate feedback on format errors without having to understand the
pipeline.

| Schema | Validates |
|---|---|
| `item.schema.json` | `data/items.json` |
| `polarity.schema.json` | `data/polarities.json` |
| `ui.schema.json` | `i18n/<lang>/ui.json` |

Schemas also serve as the format documentation — each field carries a
description. Start reading at the schema for the file you want to consume.