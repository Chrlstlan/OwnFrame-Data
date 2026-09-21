# scripts/

The data pipeline: fetches the official sources, rebuilds the generated files,
and validates the result.

| Script | Purpose |
|---|---|
| `fetch.mjs` | Pull the official Public Export files and the drop table |
| `build.mjs` | Rebuild `data/items.json` and `data/drops/` from the fetched sources |
| `validate.mjs` | Run all schema and consistency checks |
| `diff-report.mjs` | List what changed since the previous refresh |

`npm run fetch` / `npm run build` / `npm run validate` wrap these once the
pipeline lands in this repository.

Generated output stays out of the pipeline working tree and lands directly in
`data/`. The raw fetched exports are never committed.