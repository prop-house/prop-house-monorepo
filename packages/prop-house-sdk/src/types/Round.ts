// round will correlate to space schema?
// https://github.com/snapshot-labs/snapshot.js/blob/master/src/schemas/space.json

export interface Strategy {
  name: string;
  params: {
    name: string;
    params: {
      symbol: string;
      address: string;
    };
  };
}

export interface Validation {
  name: string;
  params: any;
}

export interface Round {
  name: string;
  network: string;
  symbol: string;
  strategies: Strategy[];
  validation: Validation;
}
