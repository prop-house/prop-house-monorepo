import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { InfiniteAuctionProposal } from '../proposal/infauction-proposal.entity';
import { Proposal } from '../proposal/proposal.entity';
import { DeleteProposalDto } from '../proposal/proposal.types';
import { ProposalsService } from '../proposal/proposals.service';
import { ConfigService } from '@nestjs/config';
import { DiscordBotConfig } from 'src/config/configuration';
import {
  Client,
  GuildMemberRoleManager,
  Interaction,
  TextChannel,
} from 'discord.js';
import { REST } from '@discordjs/rest';
import { GatewayIntentBits, Routes } from 'discord-api-types/v10';
import { AuctionsService } from 'src/auction/auctions.service';

interface ServerConfig {
  id: string;
  events: string[];
}

// {'event.string': ['guild', 'guild1']}
type GuildEventMap = { [key: string]: string[] };

@Injectable()
export class DiscordService {
  private readonly logger: Logger = new Logger(DiscordService.name);
  private guildEventMap: GuildEventMap = {};
  private readonly client: Client | undefined;
  private readonly restClient: REST | undefined;

  private readonly commands = [
    {
      name: 'getprop',
      description: 'Get information about a proposal!',
      options: [
        {
          name: 'propid',
          description: 'The proposal ID',
          required: true,
          type: 4,
        },
      ],
    },
    {
      name: 'deleteprop',
      description: 'Delete a proposal!',
      options: [
        {
          name: 'propid',
          description: 'The proposal ID',
          required: true,
          type: 4,
        },
      ],
    },
  ];

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly proposalsService: ProposalsService,
    private readonly auctionsService: AuctionsService,
    private readonly configService: ConfigService,
  ) {
    this.guildEventMap = this.decodeConfig(
      configService.get('DISCORD_MAP', ''),
    );
    this.logger.log(
      `Registered discord event mapping: ${JSON.stringify(this.guildEventMap)}`,
    );
    const { appId, token } = configService.get<DiscordBotConfig>('discordBot');
    if (appId && token) {
      this.restClient = new REST({ version: '10' }).setToken(token);
      try {
        this.restClient
          .put(Routes.applicationCommands(appId), { body: this.commands })
          .then(() => {
            this.logger.debug('Registered Discord bot slash commands');
          });
      } catch (error) {
        this.logger.error(error);
      }

      this.client = new Client({ intents: [GatewayIntentBits.Guilds] });
      this.client.once('ready', (c) => {
        this.logger.log(`Discord bot ready, logged in as ${c.user.tag}`);
        this.logger.debug(
          `Register bot with https://discord.com/api/oauth2/authorize?client_id=${appId}&permissions=34880&scope=bot%20applications.commands`,
        );
      });

      this.client.on('interactionCreate', async (interaction: Interaction) => {
        if (!interaction.isCommand()) return;

        if (interaction.commandName === 'getprop') {
          const propId = interaction.options.getInteger('propid');
          try {
            const proposal = await proposalsService.findOne(propId);
            const strRepresentation = [
              `Prop ${propId}: ${proposal.title}`,
            ].join('\n');
            await interaction.reply(strRepresentation);
          } catch (error) {
            this.logger.error(error);
            await interaction.reply(
              `Ran into an error fetching proposal ${propId}, did you have the correct ID?`,
            );
          }
        }

        if (interaction.commandName === 'deleteprop') {
          // Check if admin of _any type_ to prevent DB strain
          const isAdmin =
            (interaction.member.roles as GuildMemberRoleManager).cache
              .filter((r) => r.name.includes('prop-admin'))
              .map((i) => i).length > 0;
          if (!isAdmin) {
            return interaction.reply("Sorry, you can't do that");
          }
          const propId = interaction.options.getInteger('propid');
          const proposal = await proposalsService.findOne(propId);
          const auction = await auctionsService.findOne(proposal.auctionId)
          const communityId = await auction.community
          const isHouseAdmin =
            (interaction.member.roles as GuildMemberRoleManager).cache
              .filter((r) => r.name === `prop-admin-${communityId}`)
              .map((i) => i).length > 0;
          if (!isHouseAdmin) {
            return interaction.reply(`Sorry, you're not an admin for ${communityId}`);
          }
          try {
            await proposalsService.remove(propId);
            const strRepresentation = [
              `Prop ${propId} deleted :noun_salute:`,
            ].join('\n');
            await interaction.reply(strRepresentation);
          } catch (error) {
            this.logger.error(error);
            await interaction.reply(
              `Ran into an error deleting proposal ${propId}, did you have the correct ID?`,
            );
          }
        }
      });

      this.client.login(token);
    }
  }

  decodeConfig(configString: string = ''): GuildEventMap {
    const serverConfigs: ServerConfig[] = configString
      .split(';')
      .map((serverString: string) => {
        const [id, eventsString] = serverString.split(':');
        if (!eventsString) return undefined;
        return {
          id,
          events: eventsString.split(','),
        };
      })
      .filter((p) => p !== undefined);
    return serverConfigs.reduce((acc, server) => {
      for (const event of server.events) {
        if (!acc[event]) acc[event] = [];
        acc[event] = [...acc[event], server.id];
      }
      return acc;
    }, {} as GuildEventMap);
  }

  @OnEvent('proposal.delete')
  async proposalDeleted(payload: DeleteProposalDto) {
    if (this.client === undefined) return;
    const servers = this.guildEventMap['proposal.delete'];
    if (!servers) return;
    for (const server of servers) {
      try {
        const guild = await this.client.guilds.fetch({ guild: server });
        const channel = await guild.channels.cache.find(
          (ch) => ch.name === 'ph-log',
        );
        const msg = [`Deleted Proposal ${payload.id}`].join('\n');
        await (channel as TextChannel).send(msg);
      } catch (error) {
        this.logger.error(error, '', 'proposal.delete event');
      }
    }
  }

  @OnEvent('proposal.update')
  async proposalUpdated(payload: Proposal | InfiniteAuctionProposal) {}

  @OnEvent('proposal.create')
  async proposalCreated(payload: Proposal | InfiniteAuctionProposal) {
    if (this.client === undefined) return;
    const servers = this.guildEventMap['proposal.create'];
    if (!servers) return;
    for (const server of servers) {
      try {
        const guild = await this.client.guilds.fetch({ guild: server });
        const channel = await guild.channels.cache.find(
          (ch) => ch.name === 'ph-log',
        );
        const msg = [
          `New Proposal ${payload.id}`,
          payload.title,
          `Round ${payload.auction.title}`,
        ].join('\n');
        await (channel as TextChannel).send(msg);
      } catch (error) {
        this.logger.error(error, '', 'proposal.create event');
      }
    }
  }
}
