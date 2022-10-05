import { ArgsType, Field, Int, PartialType } from '@nestjs/graphql';

@ArgsType()
export class PaginationArgs {
  @Field((type) => Int)
  offset: number = 0;

  @Field((type) => Int)
  limit: number = 10;
}
