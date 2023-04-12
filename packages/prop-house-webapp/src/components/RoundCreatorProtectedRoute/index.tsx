import { Navigate } from 'react-router-dom';

interface PropCreatorProtectedRouteProps {
  account: `0x${string}` | undefined;
  children: JSX.Element;
}

const PropCreatorProtectedRoute = ({ account, children }: PropCreatorProtectedRouteProps) => {
  if (!account) return <Navigate to="/" />;

  return children;
};

export default PropCreatorProtectedRoute;
