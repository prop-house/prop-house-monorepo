<h1 align="center">
  @prophouse/sdk-react
</h1>
<p align="center">
  Useful tools for interacting with the Prop House protocol from React applications
</p>
<p align="center">
  <a href="https://www.npmjs.com/package/@prophouse/sdk-react">
    <img src="https://img.shields.io/npm/v/@prophouse/sdk-react.svg?style=flat" />
  </a>
  <a href="https://prop.house/">
    <img src="https://img.shields.io/badge/website-prop.house-blue?style=flat-square">
  </a>
</p>

## Installation

```sh
npm install @prophouse/sdk-react
# OR
yarn add @prophouse/sdk-react
```

## Usage

### Provider

The `PropHouseProvider` component is used to provide a `PropHouse` instance to the application.

Currently, `wagmi` is required by the `PropHouseProvider`.

```tsx
import { PropHouseProvider } from '@prophouse/sdk-react'
import { WagmiConfig, createClient } from 'wagmi'
import { getDefaultProvider } from 'ethers'

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

const App = () => {
  return (
    <WagmiConfig client={client}>
      <PropHouseProvider>
        <MyComponent />
      </PropHouseProvider>
    </WagmiConfig>
  )
}
```

### Hooks

#### `usePropHouse`

The `usePropHouse` hook is used to access the `PropHouse` instance provided by the `PropHouseProvider` component.

```tsx
import { usePropHouse } from '@prophouse/sdk-react'

const MyComponent = () => {
  const propHouse = usePropHouse()

  return (
    <div>
      <p>Prop House Contract: {propHouse.contract.address}</p>
    </div>
  )
}
```
