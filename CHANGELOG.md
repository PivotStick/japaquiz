# Changelog
All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.0.8] - 2020-12-13
### Added
- The input for quizz now autofocus on first join

### Changed
- New symbols for the filter's links (**❋** & **↩︎**)
- On click hint now always focus the input
- Links now have a white background

## [0.0.7] - 2020-11-08
### Added
- New link in the bottom right
- The Vocabulary for **Family Members** is now added!
- The Vocabulary for the **Color Names** is now added!

### Changed
- Changed **"人"**'s meaning from ***"Homme"*** to ***"La Personne"***.
- The styles of links has been changed are now in a component (**Links.svelte**)


## [0.0.6] - 2020-11-08
### Added
- There is now link references for every vocabulary and kana
- Kana section is now finished, all content is here, the new Katakana combinations is now available!

### Changed
- The filters are reordered


## [0.0.5] - 2020-11-07
### Added
- It is now possible to choose de maximum number generated in the *"number page"*

### Changed
- Some details has changed, the "mode" button is now in french, and each page has a white background so the page transition doesn't look weird


## [0.0.4] - 2020-11-07
### Added
- All hiragana and katakana combinations added
- New vocabularies for **country names** & **domestic animals**!

### Changed
- Some modals now have a white background and are displayed in front of everything (even if there is an animation)
- **"kana.js"** no longer exists and is now a folder with separated files.


## [0.0.3] - 2020-11-06
### Added
- A new component for the button is now created

### Changed
- The numbers page is now beautiful!

### Fixed
- A bug with the japanese number generated is now fixed. The correct japanese number will now be generated!


## [0.0.2] - 2020-11-05
### Added
- You can now train to write japanese number between **1** to **9 999**!

### Changed
- Code factorization, things are now clickable :)
- Link to Julien Fontanier has changed to his course introduction


## [0.0.1] - 2020-11-05
### Added
- New pages! **"Numbers"** & **"Vocabulary"**!
- A link to our sensei [**Julien Fontanier**](https://www.youtube.com/channel/UChFfLNTK64xQj7NscGmLLLg)
- Added alot of new Vocabulary:
    - Domestic Equipment
    - First Kanji
    - Numbers
    - Politeness Expressions

### Changed
- Navigation menu is now beautiful! かわいいー〜ー
- Filters menu is now beautiful! 😱

### Fixed
- You are now unable to unselect all filters!


## [0.0.0] - 2020-11-04
### Added
- **CHANGELOG.md** now added!
- Component **Filters.svelte** now added for factorization.

### Changed
- **Kanji.svelte** and **Infinite.svelte** are now using the **Filters.svelte** component
- **History.svelte** will now animate history elements when you show them.
- **Quizz.svelte**: The heading text aligned to be centered.