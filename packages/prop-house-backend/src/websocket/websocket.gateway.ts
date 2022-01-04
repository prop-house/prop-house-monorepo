import { OnEvent } from '@nestjs/event-emitter';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;
  users: number = 0;

  async handleConnection() {
    this.users++;
    this.server.emit('users', this.users);
    console.log('new connection', this.users);
  }

  async handleDisconnect() {
    this.users--;
    this.server.emit('users', this.users);
    console.log('disconnected', this.users);
  }

  @OnEvent('vote.stored')
  async onVoteStored(payload: any) {
    this.server.emit('vote', payload);
  }

  /**
   * When a proposal's score is rolled up
   * @param payload
   */
  @OnEvent('proposal.rolledUp')
  async onProposalRolledUp(payload: any) {
    this.server.emit(
      'proposal.scoreUpdate',
      ts({
        id: payload.id,
        score: payload.score,
        auctionId: payload.auctionId,
      }),
    );
  }
}

const ts = <T>(payload: T) => ({ t: new Date().getTime(), payload });
