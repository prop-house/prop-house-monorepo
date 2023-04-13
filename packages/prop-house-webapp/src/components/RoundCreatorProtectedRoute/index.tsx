import { Navigate } from 'react-router-dom';

interface RoundCreatorProtectedRouteProps {
  account: `0x${string}` | undefined;
  children: JSX.Element;
}

const RoundCreatorProtectedRoute = ({ account, children }: RoundCreatorProtectedRouteProps) => {
  if (!account) return <Navigate to="/" />;

  return children;
};

export default RoundCreatorProtectedRoute;
