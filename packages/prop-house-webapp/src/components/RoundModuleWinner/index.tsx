import { Round } from '@prophouse/sdk-react';
import React from 'react';
import RoundModuleCard from '../RoundModuleCard';

const RoundModuleWinner: React.FC<{ round: Round }> = ({ round }) => {
  return (
    <RoundModuleCard
      title={'Winners'}
      content={
        <>
          <p style={{ fontWeight: 'bold' }}>What determines a winning proposal?</p>
          <br />
          {/* TODO: Not a thing */}
          {/* <p>{`Proposals that meet the round quorum (${round.quorum} votes) before the voting period ends.`}</p> */}
        </>
      }
      type="winner"
    />
  );
};

export default RoundModuleWinner;
