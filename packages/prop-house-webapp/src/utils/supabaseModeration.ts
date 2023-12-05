import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://kdzewvcunwylbsiiljrg.supabase.co',
  process.env.REACT_APP_SUPABASE_KEY!,
);

export const getHiddenPropIds = async (roundAddress: string) => {
  try {
    const { data: roundFetched, error: roundFetchError } = await supabase
      .from('rounds')
      .select()
      .eq('address', roundAddress);
    if (roundFetchError) throw roundFetchError;
    return roundFetched[0] && roundFetched[0].hiddenPropIds ? roundFetched[0].hiddenPropIds : [];
  } catch (e) {
    console.log(e);
  }
};

export const getIsMod = async (houseAddress: string, account: string) => {
  try {
    const { data, error } = await supabase.from('houses').select().eq('address', houseAddress);
    if (error) throw error;
    if (!data) return false;
    return data[0] && data[0].moderators ? data[0].moderators.includes(account) : false;
  } catch (e) {
    console.log(e);
  }
};

export const hideProp = async (roundAddress: string, propId: number) => {
  try {
    const { data: roundFetched, error: roundFetchError } = await supabase
      .from('rounds')
      .select()
      .eq('address', roundAddress);
    if (roundFetchError) throw roundFetchError;

    // if round not in db, add it
    if (!roundFetched[0]) {
      const { data, error } = await supabase
        .from('rounds')
        .insert({ address: roundAddress, hiddenPropIds: [propId] });

      if (error) throw error;
      return data;
    }

    const oldHiddenPropIds = roundFetched[0].hiddenPropIds ? roundFetched[0].hiddenPropIds : [];
    const updatedHiddenPropIds = [...oldHiddenPropIds, propId];

    const { data, error } = await supabase
      .from('rounds')
      .update({ hiddenPropIds: updatedHiddenPropIds })
      .eq('address', roundAddress);
    if (error) throw error;
    return data;
  } catch (e) {
    console.log(e);
  }
};
