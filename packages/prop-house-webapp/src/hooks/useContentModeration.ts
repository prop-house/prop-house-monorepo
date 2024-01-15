import { House } from '@prophouse/sdk-react';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

/**
 * Supplying a house will check for mod status as a house admin or superadmin.
 * Not supplying it will only check for superadmin status.
 */
export const useContentModeration = (house?: House) => {
  const { address: account } = useAccount();
  const [isMod, setIsMod] = useState<boolean | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);

  const hideProp = async (roundAddress: string, propId: number) => {
    try {
      const { data: propFetched } = await supabase
        .from('proposals')
        .select()
        .eq('roundAddress', roundAddress)
        .eq('proposalId', propId)
        .single();

      // if prop is already hidden, do nothing
      if (propFetched && propFetched.hidden) return;

      const { data, error } = await supabase
        .from('proposals')
        .insert({ roundAddress, proposalId: propId, hidden: true });

      if (error) throw error;
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  const hideRound = async (address: string) => {
    try {
      const { data: roundFetched } = await supabase
        .from('rounds')
        .select()
        .eq('address', address)
        .single();

      // if round doesnt exist, create round and hide it
      if (!roundFetched) {
        await supabase.from('rounds').insert({ address, hidden: true });
        return;
      }

      // if prop is already hidden, do nothing
      if (roundFetched.hidden) return;

      const { data, error } = await supabase.from('rounds').update({ hidden: true });
      if (error) throw error;
      return data;
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    if (!account || isMod !== undefined || !shouldFetch) return;

    const getIsMod = async (account: string, houseAddress?: string) => {
      try {
        setShouldFetch(false);
        const { data: superadmin } = await supabase
          .from('superadmins')
          .select()
          .eq('address', account)
          .single();

        if (superadmin) {
          setIsMod(superadmin ? true : false);
          return;
        }

        // if not a super admin and no house passed, not a mod
        if (!houseAddress) {
          setIsMod(false);
          return;
        }

        const { data: house } = await supabase
          .from('houses')
          .select()
          .eq('address', houseAddress)
          .single();

        if (!house) {
          setIsMod(false);
          return;
        }
        setIsMod(house.moderators.includes(account));
      } catch (e) {
        console.log(e);
      }
    };

    getIsMod(account, house && house.address);
  });

  return { isMod, hideProp, hideRound };
};
