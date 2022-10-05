# Prop House Backend

The Prop House backend stores all the signed data related to Auctions, Proposals, and Votes.

## GraphQL

In addition to the normal REST API, the Prop House backend provides a [GraphQL](https://graphql.org) interface for querying data about Auctions, Proposals, and Votes. GraphQL should be the preferred method of fetching data because it:

- Allows you to request only the information you want
- Fetch related information in a single query
- Has a [playground](https://prod.backend.prop.house/graphql) where you can interactively develop queries

### Playground

The Prop House GraphQL interface features a playground that provides documentation on the query and response schemas and linting. You can open the playground at https://prod.backend.prop.house/graphql and build your own queries or copy the examples below.

### Queries

The PH GraphQL interface provides a handful of queries:

| Query Name         | Arguments                                                | Description                                                            |
| ------------------ | -------------------------------------------------------- | ---------------------------------------------------------------------- |
| `auction`          | `id: Int`                                                | Fetch a single auction record based on its ID                          |
| `auctions`         | `offset: Int`<br>`limit: Int`<br>`where: Auction`        | Fetch the Auctions that match the criteria Auction provided as `where` |
| `auctionsByStatus` | `offset: Int`<br>`limit: Int`<br>`status: AuctionStatus` | Fetch Auctions that match the provided status                          |
| `proposal`         | `id: Int`                                                | Fetch a proposal based on its ID                                       |
| `community`        | `id: Int`                                                | Fetch a community based on its ID                                      |
| `communities`      | _None_                                                   | Fetch all communities available on the Prop House                      |
| `findByAddress`    | `address: string`                                        | Fetch a Community based on its token address                           |

### Examples

A common use case is to fetch all the auctions for a given Community. This query could be used to render a page that shows the Auctions for a Community and some basic information about their proposals.

```gql
{
  findByAddress(address: "0x898a7dbfddf13962df089fbc8f069fa7ce92cdbb") {
    name
    description
    auctions {
      description
      numWinners
      fundingAmount
      status
      proposals {
        title
        score
        address
      }
    }
  }
}
```

The above example requests some basic information about the Nouns Japan Community, the Auctions within that community, as well as the Proposals in each Auction.

You'll notice that we're not loading the entirety of each entity, instead we're only loading a couple properties that'd be required for rendering a simple set of cards. With GraphQL you can request only what you need, and receive only what you ask for.

We can also jump half way into this relationship chain and fetch only the Auctions that are currently Open and accepting proposals. This may be useful for a landing page that shows users where they can submit proposals to.

```gql
{
  auctionsByStatus(status: Open) {
    title
    numWinners
    fundingAmount
    proposalEndTime
    description
    community {
      name
    }
    proposals {
      id
      title
      tldr
    }
  }
}
```

Similar to the first example, if we know that an Auction is Open the only date we really worry about is the Proposal deadline date. Fetching the other dates would be excessive if we weren't rendering them.

Within each query we can choose to load its related entities or not, we could even load several layers of relations, although it should be avoided...

```gql
{
  proposal(id: 125) {
    id
    title
    auction {
      id
      proposals {
        id
        title
        score
      }
    }
  }
}
```

This could be the case where we are attempting to render a single proposal but want to fetch some information about the other proposals int he same Auction. With a REST API this would require a handful of requests or the API would return too much data. With GraphQL we can ask for just what we need.

Now, go ahead and play with the GraphQL Playground at https://prod.backend.prop.house/graphql and try some of these example queries. See the `Schema` and `Docs` tabs on the right side for more information about the shapes and fields available.


# Contributing

## Installation

```bash
$ yarn
```

## Running the app

```bash
# Start containerized development services
$ docker-compose up -d

# Perform database migrations
$ yarn migration:run

# development
$ yarn start

# watch mode
$ yarn start:dev
```

## Making entity changes

Since Prop House is now in production, TypeORM will no longer automatically synchronize changes. In order to make changes to entities' database tables and relations you must generate a migration with your set of changes. This requires a running local database but TypeORM will generate migrations for you.

For example, you could want to add a property called `language` to the `Proposal` entity. You would add the property/column as normal to `proposal.entity.ts` like so:

```typescript
@Column()
language: string;
```

Previously TypeORM would automatically apply this change to the database, however automatic synchronization is highly discouraged for production applications. Instead developers should create migrations that have an `up` and `down` action to apply or roll back database schema changes. This keeps changes intentional and behavior explicit.

If you have the development database running (with or without data) you can have TypeORM generate the migrations for you automatically. The CLI will compare the schemas as defined by the project's entities with the schema of the connected database. If there are any differences, it will generate a migration to bring the two in sync. These migrations can then be committed along with your code changes for review by the other contributors.

To generate a migration for your schema change run:

```bash
$ yarn migration:generate AddProposalLanguage
```

This will cause the TypeORM CLI to generate a new migration file under `src/db/migrations` with the SQL commands to apply and revert the schema changes. **Note: this will compare against your locally connected database, so ensure you've run all migrations already.**

When checking out new code or deploying to production, the following command will apply any local migrations:

```bash
$ yarn migration:run
```

## Migration Seed

The initial migration has been seeded to match the production database at type of writing. Syncing the production database up with the new migration scheme will require adding the following to the production migrations table manually:

| ID     | timestamp     | name                          |
| ------ | ------------- | ----------------------------- |
| _auto_ | 1650506499501 | InitialMigration1650506499501 |
| _auto_ | 1651112951360 | AddTldr1651112951360          |

```sql

CREATE SEQUENCE migrations_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."migrations" (
    "id" integer DEFAULT nextval('migrations_id_seq') NOT NULL,
    "timestamp" bigint NOT NULL,
    "name" character varying NOT NULL,
    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
) WITH (oids = false);


INSERT INTO "migrations" ("id", "timestamp", "name") VALUES
(1,	1650506499501,	'InitialMigration1650506499501'),
(2,	1651112951360,	'AddTldr1651112951360');
```
