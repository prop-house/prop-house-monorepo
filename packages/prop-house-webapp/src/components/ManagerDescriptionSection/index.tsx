import classes from './ManagerDescriptionSection.module.css';
import { FaLink as LinkIcon } from 'react-icons/fa';

const ManagerDescriptionSection = () => {
  return (
    <>
      <div className={classes.describeHouseSection}>
        <span className={classes.nameAndButton}>
          <p className={classes.title}>Describe your House</p>
          <button>
            <LinkIcon size={10} />
            <span>Add Link</span>
          </button>
        </span>
        <textarea rows={5} placeholder="Tell everyone what your House is about" />
      </div>
    </>
  );
};

export default ManagerDescriptionSection;
