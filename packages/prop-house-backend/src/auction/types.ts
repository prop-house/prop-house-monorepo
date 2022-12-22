export type EventStatus =
  // No Tweet has been sent yet
  | null
  // The auction was created and discovered by the Tweeter task
  | 'auctionCreated'
  // The auction is now available for proposals
  | 'auctionOpen'
  // The proposal period has ended, and is now open for voting
  | 'auctionVoting'
  // The auction/round has now closed, no further votes are allowed
  | 'auctionClosed';
