-- Adminer 4.8.1 PostgreSQL 11.14 dump
USE postgres;

CREATE SEQUENCE auction_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 2 CACHE 1;

CREATE TABLE "public"."auction" (
    "id" integer DEFAULT nextval('auction_id_seq') NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "title" character varying NOT NULL,
    "startTime" timestamp NOT NULL,
    "proposalEndTime" timestamp NOT NULL,
    "votingEndTime" timestamp NOT NULL,
    "amountEth" integer NOT NULL,
    "numWinners" integer NOT NULL,
    "createdDate" timestamp NOT NULL,
    "lastUpdatedDate" timestamp,
    "communityId" integer,
    CONSTRAINT "PK_9dc876c629273e71646cf6dfa67" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "auction" ("id", "visible", "title", "startTime", "proposalEndTime", "votingEndTime", "amountEth", "numWinners", "createdDate", "lastUpdatedDate", "communityId") VALUES
(1,	'1',	'Round 1',	'2021-08-08 05:06:49',	'2021-08-08 05:06:49',	'2021-08-08 05:06:49',	5,	3,	'2021-08-08 05:06:49',	NULL,	1),
(2,	'1',	'Round 2',	'2021-08-08 05:06:49',	'2021-08-08 05:06:49',	'2024-08-08 05:06:49',	1,	20,	'2021-08-08 05:06:49',	NULL,	1),
(3,	'1',	'Round 3',	'2021-08-08 05:06:49',	'2023-08-08 05:06:49',	'2024-08-08 05:06:49',	2,	10,	'2021-08-08 05:06:49',	NULL,	1);

CREATE SEQUENCE community_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."community" (
    "id" integer DEFAULT nextval('community_id_seq') NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "contractAddress" character varying NOT NULL,
    "name" character varying NOT NULL,
    "profileImageUrl" character varying NOT NULL,
    "createdDate" timestamp NOT NULL,
    "lastUpdatedDate" timestamp,
    "communityId" integer NOT NULL,
    CONSTRAINT "PK_cae794115a383328e8923de4193" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "community" ("id", "visible", "contractAddress", "name", "profileImageUrl", "createdDate", "lastUpdatedDate", "communityId") VALUES
(1,	'1',	'0x9C8fF314C9Bc7F6e59A9d9225Fb22946427eDC03',	'Nouns',	'https://gateway.pinata.cloud/ipfs/QmRzHf4PHBDSHu4txCHXtFRnvLHrgYdVBTSkGSeTHJWR4a',	'2021-08-08 05:06:49',	NULL,	1);

CREATE SEQUENCE file_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."file" (
    "id" integer DEFAULT nextval('file_id_seq') NOT NULL,
    "hidden" boolean DEFAULT false NOT NULL,
    "address" character varying NOT NULL,
    "name" character varying NOT NULL,
    "mimeType" character varying NOT NULL,
    "ipfsHash" character varying NOT NULL,
    "pinSize" integer NOT NULL,
    "ipfsTimestamp" character varying NOT NULL,
    "createdDate" timestamp NOT NULL,
    CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id")
) WITH (oids = false);


CREATE SEQUENCE migrations_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 5 CACHE 1;

CREATE TABLE "public"."migrations" (
    "id" integer DEFAULT nextval('migrations_id_seq') NOT NULL,
    "timestamp" bigint NOT NULL,
    "name" character varying NOT NULL,
    CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "migrations" ("id", "timestamp", "name") VALUES
(1,	1650506499501,	'InitialMigration1650506499501'),
(2,	1650506803822,	'AddIsWinner1650506803822'),
(3,	1651112951360,	'AddTldr1651112951360'),
(4,	1651459084663,	'AddCommunities1651459084663'),
(5,	1652930687797,	'RemoveVoteType1652930687797');

CREATE SEQUENCE proposal_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 START 6 CACHE 1;

CREATE TABLE "public"."proposal" (
    "address" character varying NOT NULL,
    "signedData" jsonb NOT NULL,
    "id" integer DEFAULT nextval('proposal_id_seq') NOT NULL,
    "visible" boolean DEFAULT true NOT NULL,
    "title" character varying NOT NULL,
    "who" text NOT NULL,
    "what" text NOT NULL,
    "tldr" text NOT NULL,
    "links" text NOT NULL,
    "auctionId" integer NOT NULL,
    "score" numeric DEFAULT '0' NOT NULL,
    "createdDate" timestamp NOT NULL,
    "lastUpdatedDate" timestamp,
    "isWinner" boolean DEFAULT false NOT NULL,
    CONSTRAINT "PK_ca872ecfe4fef5720d2d39e4275" PRIMARY KEY ("id")
) WITH (oids = false);

INSERT INTO "proposal" ("address", "signedData", "id", "visible", "title", "who", "what", "tldr", "links", "auctionId", "score", "createdDate", "lastUpdatedDate", "isWinner") VALUES
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	2,	'1',	'Synthetic Nouns via Playground',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	1,	0,	'2022-06-15 10:51:14.736',	NULL,	'0'),
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	1,	'1',	'Co2 Offset: Plant 10,000 trees',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	1,	0,	'2022-06-15 10:51:14.736',	NULL,	'0'),
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	4,	'1',	'Noun o''clock bots',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	2,	0,	'2022-06-15 10:51:14.736',	NULL,	'0'),
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	3,	'1',	'Nouns Trait Marketplace',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	2,	0,	'2022-06-15 10:51:14.736',	NULL,	'0'),
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	5,	'1',	'Nouns API',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	3,	0,	'2022-06-15 10:51:14.736',	NULL,	'0'),
('0x0000000000000000000000000000000000000000',	'{"signer": "0x0000000000000000000000000000000000000000", "message": "{\"title\":\"Nouns API\",\"who\":\"\",\"what\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum \",\"tldr\":\"Lorem ipsum dolor sit amet, consectetur adipiscing elit\",\"links\":\"\",\"parentAuctionId\":1}", "signature": "0x497a292970dbd5f4e270e2f140f0512489108a1ef416760218198911764fd3fc01f9987ff104e174767f82c3f929bac0b150de01902b7c2844054b561ce483a51b"}',	6,	'1',	'Nouns Delegation Portal',	'',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum ',	'Lorem ipsum dolor sit amet, consectetur adipiscing elit',	'',	3,	0,	'2022-06-15 10:51:14.736',	NULL,	'0');

CREATE SEQUENCE vote_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;

CREATE TABLE "public"."vote" (
    "address" character varying NOT NULL,
    "signedData" jsonb NOT NULL,
    "id" integer DEFAULT nextval('vote_id_seq') NOT NULL,
    "direction" integer DEFAULT '1' NOT NULL,
    "createdDate" timestamp NOT NULL,
    "proposalId" integer NOT NULL,
    "auctionId" integer NOT NULL,
    "weight" numeric DEFAULT '1' NOT NULL,
    CONSTRAINT "PK_2d5932d46afe39c8176f9d4be72" PRIMARY KEY ("id")
) WITH (oids = false);


ALTER TABLE ONLY "public"."auction" ADD CONSTRAINT "FK_57ed67d674d83b3e416123687e6" FOREIGN KEY ("communityId") REFERENCES community(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."proposal" ADD CONSTRAINT "FK_4903e953d99225f0b6f9d5ad26f" FOREIGN KEY ("auctionId") REFERENCES auction(id) NOT DEFERRABLE;

ALTER TABLE ONLY "public"."vote" ADD CONSTRAINT "FK_a6099cc53a32762d8c69e71dcd1" FOREIGN KEY ("proposalId") REFERENCES proposal(id) NOT DEFERRABLE;

-- 2022-06-15 19:10:50.929309+00

-- 2022-06-28 add missing id sequence resets

ALTER SEQUENCE auction_id_seq RESTART WITH 5;
ALTER SEQUENCE proposal_id_seq RESTART WITH 7;
