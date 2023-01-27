import clsx from 'clsx';
import { useAppSelector } from '../../hooks';
import classes from './AdminTool.module.css';

export interface AdminToolProps {
  children: React.ReactNode;
}
const AdminTool: React.FC<AdminToolProps> = (props: AdminToolProps) => {
  const { children } = props;
  const displayAdmin = useAppSelector(state => state.configuration.displayAdmin);
  return (
    <div className={clsx(displayAdmin ? classes.displayAdminTool : classes.hideAdminTool)}>
      {children}
    </div>
  );
};

export default AdminTool;
