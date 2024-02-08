import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

export const useIsHiddenRound = (roundAddress: string) => {
  const [isHidden, setIsHidden] = useState<boolean | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchIsHidden = async (roundAddress: string) => {
      setShouldFetch(false);
      try {
        const { data: round } = await supabase
          .from('rounds')
          .select()
          .eq('address', roundAddress)
          .eq('hidden', true)
          .single();

        setIsHidden(round ? true : false);
      } catch (e) {
        console.log(e);
      }
    };
    fetchIsHidden(roundAddress);
  }, [shouldFetch, roundAddress]);

  const refresh = () => {
    setShouldFetch(true);
  };
  return { isHidden, refresh };
};
