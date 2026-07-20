# NH Interactive Architecture — Phase A

## Entry point
- `index.html`: page structure only.

## Styles
- `css/main.css`: shared responsive design and all current component styles.

## Data
- `data/portal-data.js`: New Horizon 1–3 vocabulary database.

## Application code
- `js/app.js`: dashboard, language settings, textbook navigation, study modes, statistics, achievements, and shared utilities.
- `js/adventure.js`: Adventure worlds, stages, battles, HP, rewards, and Adventure save data.

## Assets
- `assets/images/`: textbook cover images.

## Loading order
1. Vocabulary data
2. Core application
3. Adventure system

This separation lets future Quest, Teacher, Profile, and Collection systems be added without rewriting the vocabulary database or study games.
