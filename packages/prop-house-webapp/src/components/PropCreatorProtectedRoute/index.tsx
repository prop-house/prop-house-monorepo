import NoActiveHouseModal from '../NoActiveHouseModal';

interface PropCreatorProtectedRouteProps {
  noActiveCommunity: boolean;
  children: JSX.Element;
}

const PropCreatorProtectedRoute = ({
  noActiveCommunity,
  children,
}: PropCreatorProtectedRouteProps) => {
  if (noActiveCommunity) return <NoActiveHouseModal />;

  return children;
};

export default PropCreatorProtectedRoute;
