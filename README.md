# kids-shoe-game

Browser game for toddlers to learn left/right shoes. No build step.

## Run locally

    python -m http.server 8080

Open http://localhost:8080 on a tablet in landscape.

## Test

    npm test

## Adding a shoe set

Add an entry to `SHOE_SETS` in `js/art/shoes.js`. Draw the left shoe (toe up,
inner edge on the right) and mirror it for the right shoe. Photos used as
reference go in `photos/` (git-ignored).
