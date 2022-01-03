import { Module } from '@nestjs/common';
import { EventsGateway } from './websocket.gateway';

@Module({
  providers: [EventsGateway],
  exports: [EventsGateway],
})
export class WebsocketModule {}
