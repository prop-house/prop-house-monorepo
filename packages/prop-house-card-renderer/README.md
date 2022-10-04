# Prop House Card Renderer

This package will render a PNG that can be used as the card image for opengraph. The idea being that the tag will be something like:

```html
<meta property="og:image" content="https://cards.prop.house/100"/>
```

Then this service will serve clients that ask for the card. This will allow us to have dynamic proposal information on the card without having to rebuild the site constantly.

## Quick Start

```sh
# Install dependencies
yarn

# Create cache directory
mkdir cache

# Start script in dev, will auto restart on save
CACHE_PATH=cache yarn start:dev
```

Once the script is running you can edit the HTML block in [index.ts](src/index.ts) which uses normal JavaScript string interpolation. Pointing your browser at `http://localhost:3000/:proposalId` will render the card using the local HTML.

Alternatively, calling `http://localhost:3000/:proposalId/remote` will just render a PNG of the frontend at `https://prop.house/proposal/:proposalId/card` if frontend devs would prefer to use React and keep the card within the main codebase.
