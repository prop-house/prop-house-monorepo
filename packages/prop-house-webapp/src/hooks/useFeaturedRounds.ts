import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

export const useFeaturedRounds = () => {
  const [featuredRounds, setFeaturedRounds] = useState<string[] | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchRoundAddresses = async () => {
      setShouldFetch(false);
      try {
        const { data: rounds } = await supabase.from('featured-rounds').select();
        setFeaturedRounds(rounds ? rounds.map(r => r.address) : []);
      } catch (e) {
        console.log(e);
      }
    };

    fetchRoundAddresses();
  }, [shouldFetch]);

  const refresh = () => {
    setShouldFetch(true);
  };

  return { featuredRounds, refresh };
};
