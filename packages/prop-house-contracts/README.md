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

#### Troubleshooting

If on an M1 mac, you may receive the following error when running `starknet-devnet`:


```
+[__NSCFConstantString initialize] may have been in progress in another thread when fork() was called.
```

If so, please add the following to `~/.bash_profile`:

```
export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
```

### Format Code

```sh
yarn format
```
