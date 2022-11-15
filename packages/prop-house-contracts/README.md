# Prop House Contracts

## Development
---

### Install Dependencies

1. Install [Foundry](https://github.com/foundry-rs/foundry)
2. Install Python 3.9, activate virtualenv, and install dependencies:
    ```sh
    python3.9 -m venv ~/cairo_venv
    source ~/cairo_venv/bin/activate
    pip3 install -r requirements.txt
    ```
2a. If you run into Apple M1 chip errors related to installing fastecdsa (gmp), try:
    ```sh
    CFLAGS=-I/opt/homebrew/opt/gmp/include LDFLAGS=-L/opt/homebrew/opt/gmp/lib pip install fastecdsa
    pip3 install -r requirements.txt
    ```
3. Install submodules:
    ```sh
    git submodule update --init --recursive
    ```

### Compile TypeScript, Contracts, and Generate Typechain Typings

```sh
yarn build
```

### Tests

1. Generate test users:
    ```sh
    yarn test:users
    ```
2. Run local chains:
    ```sh
    yarn chain
    ```
3. Run tests (in a separate cairo_venv terminal):
    ```sh
    yarn test
    ```

### Format Code

```sh
yarn format
```
