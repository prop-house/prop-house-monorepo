import classes from './EditSection.module.css';
import Text from '../Text';
import { capitalize } from '../../../utils/capitalize';
import { FiEdit3 as EditIcon } from 'react-icons/fi';
import Tooltip from '../../Tooltip';

const EditSection: React.FC<{
  section?: string;
  onClick: () => void;
}> = props => {
  const { section, onClick } = props;

  return (
    <div className={classes.container} onClick={onClick}>
      {section && <Text type="title">{capitalize(section)}</Text>}

      <Tooltip content={<EditIcon />} tooltipContent="Edit" />
    </div>
  );
};

export default EditSection;
