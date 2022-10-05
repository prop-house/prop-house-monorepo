import { Dropdown } from 'react-bootstrap';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import classes from './RoundDropdown.module.css';
import { useDispatch } from 'react-redux';
import { Dispatch, SetStateAction } from 'react';

interface SortOptionProps {
  id: SortMethod;
  title: string;
  bgColor: string;
}

export enum SortMethod {
  SortBy,
  CreatedDate,
  MostVotes,
}

const sortOptions: SortOptionProps[] = [
  {
    id: SortMethod.SortBy,
    title: 'Sort By',
    bgColor: classes.pink,
  },
  {
    id: SortMethod.CreatedDate,
    title: 'Created Date',
    bgColor: classes.green,
  },
  {
    id: SortMethod.MostVotes,
    title: 'Most Votes',
    bgColor: classes.purple,
  },
];

interface RoundDropDownProps {
  sortSelection: number;
  setSortSelection: Dispatch<SetStateAction<SortMethod>>;
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

    if (id === SortMethod.CreatedDate) {
      dispatchSortProposals(dispatch, SortType.CreatedAt, false);
    } else if (id === SortMethod.MostVotes) {
      dispatchSortProposals(dispatch, SortType.VoteCount, false);
    }
    return;
  };

  const filteredSortOptions = allowSortByVotes ? sortOptions : sortOptions.filter(o => o.id !== 2);

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {filteredSortOptions[sortSelection].title}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {filteredSortOptions.map((o, index) => {
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
