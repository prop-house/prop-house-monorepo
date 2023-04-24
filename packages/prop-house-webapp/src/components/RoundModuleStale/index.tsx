import { Round } from '@prophouse/sdk-react';
import React from 'react';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleStale: React.FC<{ round: Round }> = ({ round }) => {
  return (
    <RoundModuleCard
      title={'Stale'}
      content={
        <>
          <p style={{ fontWeight: 'bold' }}>What is a stale proposal?</p>
          <br />
          {/* TODO: Not a thing */}
          {/* <p>{`Stale proposals are those that did not meet quorum (${round.quorum} votes) within the round's voting period.`}</p> */}
        </>
      }
      type="stale"
    />
  );
};

export default RoundModuleStale;
