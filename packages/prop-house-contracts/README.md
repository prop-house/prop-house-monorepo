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
3. Install submodules:
    ```sh
    git submodule update --init --recursive
    ```

### Tests

1. Generate test users:
    ```sh
    yarn test:setup
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

### Compile Contracts

```sh
yarn compile
```
