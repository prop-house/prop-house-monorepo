import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export const PropHouseProvider = (props: any) => {
  return <QueryClientProvider client={queryClient}>{props.children}</QueryClientProvider>;
};
