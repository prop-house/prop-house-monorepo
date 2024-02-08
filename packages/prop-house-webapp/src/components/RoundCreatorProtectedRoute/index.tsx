import { Navigate } from 'react-router-dom';

interface RoundCreatorProtectedRouteProps {
  account: `0x${string}` | undefined;
  children: JSX.Element;
}

// This is a route that only allows connected users to access it, if there's no connected wallet, it will redirect to the home page
const RoundCreatorProtectedRoute = ({ account, children }: RoundCreatorProtectedRouteProps) => {
  if (!account) return <Navigate to="/" />;

  return children;
};

export default RoundCreatorProtectedRoute;
