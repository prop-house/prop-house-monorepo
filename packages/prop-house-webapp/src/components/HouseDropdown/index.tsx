import { Dropdown } from 'react-bootstrap';
import { HouseUtilityBarProps } from '../HouseUtilityBar';
import classes from './HouseDropdown.module.css';

const statuses = [
  {
    id: 0,
    title: 'All rounds',
    bgColor: classes.pink,
  },
  {
    id: 1,
    title: 'Proposing',
    bgColor: classes.green,
  },
  {
    id: 2,
    title: 'Voting',
    bgColor: classes.purple,
  },
  {
    id: 3,
    title: 'Ended',
    bgColor: classes.black,
  },
];

const HouseDropdown = ({
  roundStatus,
  setRoundStatus,
  roundCount,
  setInput,
}: HouseUtilityBarProps) => {
  const handleClick = (id: number) => {
    setInput('');

    setRoundStatus(id);
  };

  return (
    <>
      <Dropdown>
        <Dropdown.Toggle variant="success" id="dropdown-basic">
          {statuses[roundStatus].title}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {statuses.map((s, index) => (
            <Dropdown.Item key={index} onClick={() => handleClick(s.id)}>
              <span>{s.title}</span>
              <span className={classes.count}>{roundCount[index]}</span>
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </>
  );
};

export default HouseDropdown;
