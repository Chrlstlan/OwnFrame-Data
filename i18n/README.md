# i18n/

App and web **UI strings** — the texts of the app and web surfaces: buttons,
labels, headings, hints, navigation. This directory exists so the community
can improve the interface translations.

This directory contains **no game item data** — item names and descriptions
are derived from the master catalog pipeline, they do not live here.

## Layout

One directory per language, named by its locale code:

```
i18n/
  de/ en/ es/ fr/ it/ ja/ ko/ pl/ pt/ ru/ tc/ th/ tr/ uk/ zh/
    ui.json        the UI strings for this language
```

## Format

`ui.json` holds the UI strings, keyed by stable string identifiers — the same
shape the OwnFrame apps consume (see the corresponding locale directories in
the OwnFrame-Shared repository):

```json
{
  "builds.title": "Builds",
  "common.cancel": "Cancel"
}
```

Keys are identifiers shared across all languages — never rename a key when
editing one language's file, or the apps lose the string.

## Contributing a correction

Found a wrong or awkward UI text in your language? Edit the single `ui.json`
of that language (see [CONTRIBUTING.md](../CONTRIBUTING.md)) — one key, one
pull request. CI validates the format against `schema/`.