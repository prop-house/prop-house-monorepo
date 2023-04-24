import { Container, Row } from 'react-bootstrap';
import classes from './HomeHeader.module.css';
import HomeTitle from '../HomeTitle';
import HomeStats from '../HomeStats';
import SearchBar from '../SeachBar';
import { useNavigate } from 'react-router-dom';
import { openInNewTab } from '../../utils/openInNewTab';
import { cmdPlusClicked } from '../../utils/cmdPlusClicked';
import { useTranslation } from 'react-i18next';
import { GlobalStats } from '@prophouse/sdk-react';

interface HomeHeaderProps {
  input: string;
  handleSeachInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  stats: GlobalStats;
}

const HomeHeader = ({ input, handleSeachInputChange, stats }: HomeHeaderProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <Row className={classes.wrapper}>
      <HomeTitle />

      <button
        className={classes.learnMoreBtn}
        onClick={e => {
          if (cmdPlusClicked(e)) {
            openInNewTab('/faq');
            return;
          }

          navigate('/faq');
        }}
      >
        {t('learnMore')} →
      </button>
      <HomeStats stats={stats} />
      <Container className={classes.searchBarContainer}>
        <SearchBar
          input={input}
          handleSeachInputChange={handleSeachInputChange}
          placeholder={t('searchCommunityHouses')}
        />
      </Container>
    </Row>
  );
};

export default HomeHeader;
