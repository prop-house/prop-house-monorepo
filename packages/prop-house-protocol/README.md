# @prophouse/protocol

Prop House is a multichain protocol that helps internet communities & creators allocate resources.

## Concepts

Prop House consists of two key concepts: [Houses](#Houses) and [Rounds](#Rounds)

### Houses
A **house** is a collection of rounds. Each house has an owner.

The responsibilities of a house owner include:
- Creating new rounds on the house.
- Inviting others to create rounds on the house.

#### Community House

Currently, only one type of house exists – the Community house. It operates based on the rules mentioned above. The house itself is an NFT and ownership of the house can be transferred at any point. 

Each round within the Community house is also an NFT, minted to the creator of the round. The holder of this NFT, referred to as the round Manager, controls the round. Similar to house ownership, round management permissions can also be transferred at will.

### Rounds

A **round** is a competition of sorts. Ethereum users compete by offering skills, ideas, or other services in an effort to win the competition.

The exact rules of the competition depend on the selections made by the creator of the round. However, certain principles remain constant:

- Users submit their offer as a proposal.
- Voters evaluate the proposals, determining whether each submitter should be declared a winner.
- If a proposal accumulates enough votes to be declared a winner, the proposer gets something for their efforts. This is likely to be an asset, like ETH, ERC20 tokens, or NFTs.

#### Timed Round

Timed rounds have two distinct periods:

1. A timed proposing period, in which users can submit proposals for consideration.
2. A timed voting period, in which voters cast votes for their favorite proposals.

Timed rounds have a pre-defined number of winners, selected by the round creator.

At the end of the voting period, proposals are sorted by voting power, and winners are automatically selected.

#### Infinite Rounds

Infinite rounds run until they are cancelled or finalized.

There are no periods specific to proposing or voting. Instead, users submit proposals for consideration, specifying an exact ask, and voters either vote "for" or "against" their proposal.

There is a vote quorum in both directions ("for" or "against"). If the "for" quorum is hit, the proposal ask will be paid to the proposer. If the "against" quorum is hit, the proposal will be marked as rejected.

If either quorum is not met, the proposal will be marked as "stale", and will be hidden in the UI.

Infinite round balances can be topped up at any time.

## Development

### Current Versions

* Scarb: [d4e43e07](https://github.com/software-mansion/scarb/commit/d4e43e07)
* Cairo: [b4c156ff](https://github.com/starkware-libs/cairo/commit/b4c156ff)

### Installing Dependencies

#### Step 1: Install Foundry

Follow the installation guide in [the Foundry Book](https://book.getfoundry.sh/getting-started/installation).

### Step 2: Install the Cairo package manager Scarb

Follow the installation guide in [Scarb's Repository](https://github.com/software-mansion/scarb).

#### Step 3: Install Cairo 1.0

**NOTE: By installing Scarb, you already have an accompanying Cairo 1.0 version which can be viewed by running `$ scarb --version`. This installation step is included to allow you maintain an independent version of Cairo. This step will also prove useful when setting up the language server in [Step 5](#step-5-setup-language-server).**

If you are on an x86 Linux system and able to use the release binary,
you can download Cairo here https://github.com/starkware-libs/cairo/releases.

For everyone, else, we recommend compiling Cairo from source like so:

```bash
# Install stable Rust
rustup override set stable && rustup update

# Clone the Cairo compiler in $HOME/Bin
cd ~/Bin && git clone https://github.com/starkware-libs/cairo.git && cd cairo

# OPTIONAL/RECOMMENDED: If you want to install a specific version of the compiler
# Fetch all tags (versions)
git fetch --all --tags
# View tags (you can also do this in the cairo compiler repository)
git describe --tags `git rev-list --tags`
# Checkout the version you want
git checkout tags/v1.0.0-alpha.6

# Generate release binaries
cargo build --all --release
```

**NOTE: Keeping Cairo up to date**

Now that your Cairo compiler is in a cloned repository, all you will need to do
is pull the latest changes and rebuild as follows:

```bash
cd ~/Bin/cairo && git fetch && git pull && cargo build --all --release
```

#### Step 4: Add Cairo 1.0 executables to your path

```bash
export PATH="$HOME/Bin/cairo/target/release:$PATH"
```

**NOTE: If installing from a Linux binary, adapt the destination path accordingly.**

This will make available several binaries. The one we use is called `cairo-test`.

#### Step 5: Setup Language Server

##### VS Code Extension

- Disable previous Cairo 0.x extension
- Install the Cairo 1 extension for proper syntax highlighting and code navigation.
Just follow the steps indicated [here](https://github.com/starkware-libs/cairo/blob/main/vscode-cairo/README.md).

##### Cairo Language Server

From [Step 3](#step-3-install-cairo-10-guide-by-abdel), the `cairo-language-server` binary should be built and executing this command will copy its path into your clipboard.

```bash
$ which cairo-language-server | pbcopy
```

Update the `languageServerPath` of the Cairo 1.0 extension by pasting the path.

### Testing

#### Solidity

```sh
yarn test:l1
```

#### Cairo

```sh
yarn test:l2
```

#### Cross-Chain

1. Install [starknet-devnet](https://0xspaceshard.github.io/starknet-devnet/docs/intro/)
2. Run local chains:
    ```sh
    yarn chain
    ```
3. Run tests
    ```sh
    yarn test:crosschain
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
