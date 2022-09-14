import { Dropdown } from 'react-bootstrap';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import classes from './RoundDropdown.module.css';
import { useDispatch } from 'react-redux';

interface Options {
  id: number;
  title: string;
  bgColor: string;
}

export enum OptionType {
  SortBy,
  CreatedDate,
  MostVotes,
}

const options: Options[] = [
  {
    id: OptionType.SortBy,
    title: 'Sort By',
    bgColor: classes.pink,
  },
  {
    id: OptionType.CreatedDate,
    title: 'Created Date',
    bgColor: classes.green,
  },
  {
    id: OptionType.MostVotes,
    title: 'Most Votes',
    bgColor: classes.purple,
  },
];

interface RoundDropDownProps {
  sortSelection: number;
  setSortSelection: any;
  allowSortByVotes: boolean;
}

const RoundDropdown = ({
  sortSelection,
  setSortSelection,
  allowSortByVotes,
}: RoundDropDownProps) => {
  const dispatch = useDispatch();

  const handleClick = (id: number) => {
    setSortSelection(id);

    if (id === OptionType.CreatedDate) {
      dispatchSortProposals(dispatch, SortType.CreatedAt, false);
    } else if (id === OptionType.MostVotes) {
      dispatchSortProposals(dispatch, SortType.Score, false);
    }
    return;
  };

  const sortOptions = allowSortByVotes ? options : options.filter(o => o.id !== 2);

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {sortOptions[sortSelection].title}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {sortOptions.map((o, index) => {
            return (
              o.id !== 0 && (
                <Dropdown.Item key={index} onClick={() => handleClick(o.id)}>
                  <span>{o.title}</span>
                </Dropdown.Item>
              )
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default RoundDropdown;
