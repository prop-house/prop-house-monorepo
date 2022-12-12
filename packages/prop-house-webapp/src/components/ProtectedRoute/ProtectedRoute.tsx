import NoActiveHouseModal from '../NoActiveHouseModal';

interface ProtectedRouteProps {
  noActiveCommunity: boolean;
  children: JSX.Element;
}

const ProtectedRoute = ({ noActiveCommunity, children }: ProtectedRouteProps) => {
  if (noActiveCommunity) return <NoActiveHouseModal />;

  return children;
};

export default ProtectedRoute;
