## Description

The Prop House backend stores all the signed data related to Auctions, Proposals, and Votes.

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

This will cause the TypeORM CLI to generate a new migration file under `src/db/migrations` with the SQL commands to apply and revert the schema changes.

When checking out new code or deploying to production, the following command will apply any local migrations:

```bash
$ yarn migration:run
```

## Migration Seed

The initial migration has been seeded to match the production database at type of writing. Syncing the production database up with the new migration scheme will require adding the following to the production migrations table manually:

| ID    | timestamp     | name                          |
| ----- | ------------- | ----------------------------- |
| _auto_ | 1650506499501 | InitialMigration1650506499501 |
