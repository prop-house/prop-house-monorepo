export interface ENSQueryHouseResponse {
  domains: [
    {
      subdomains: [{ name: string }];
    },
  ];
}
