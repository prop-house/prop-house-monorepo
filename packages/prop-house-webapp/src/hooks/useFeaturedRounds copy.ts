import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

export const useFeaturedHouses = () => {
  const [featuredHouses, setFeaturedHouses] = useState<string[] | undefined>();
  const [shouldFetch, setShouldFetch] = useState(true);

  useEffect(() => {
    if (!shouldFetch) return;

    const fetchHouseAddresses = async () => {
      setShouldFetch(false);
      try {
        const { data: houses } = await supabase.from('featured-houses').select();
        setFeaturedHouses(houses ? houses.map(r => r.address) : []);
      } catch (e) {
        console.log(e);
      }
    };

    fetchHouseAddresses();
  }, [shouldFetch]);

  const refresh = () => {
    setShouldFetch(true);
  };

  return { featuredHouses, refresh };
};
