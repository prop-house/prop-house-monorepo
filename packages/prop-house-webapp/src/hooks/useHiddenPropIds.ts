import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

export const useHiddenPropIds = (roundAddress: string) => {
  const [hiddenPropIds, setHiddenPropIds] = useState<number[] | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchHiddenPropIds = async (roundAddress: string) => {
      setShouldFetch(false);
      try {
        const { data: proposals } = await supabase
          .from('proposals')
          .select()
          .eq('roundAddress', roundAddress);

        if (!proposals) return;

        const propIds = proposals.map(p => p.proposalId);
        setHiddenPropIds(propIds);
      } catch (e) {
        console.log(e);
      }
    };

    fetchHiddenPropIds(roundAddress);
  }, [roundAddress, shouldFetch]);

  const refresh = () => {
    setShouldFetch(true);
  };

  return { hiddenPropIds, refresh };
};
