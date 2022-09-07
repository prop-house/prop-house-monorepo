import { Dropdown } from 'react-bootstrap';
import { dispatchSortProposals, SortType } from '../../utils/sortingProposals';
import classes from './RoundDropdown.module.css';
import { useDispatch } from 'react-redux';

const options = [
  {
    id: 0,
    title: 'Sort By',
    bgColor: classes.pink,
  },
  {
    id: 1,
    title: 'Created Date',
    bgColor: classes.green,
  },
  {
    id: 2,
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

    if (id === 1) {
      dispatchSortProposals(dispatch, SortType.CreatedAt, false);
    } else if (id === 2) {
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
