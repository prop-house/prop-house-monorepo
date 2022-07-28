import { useNavigate } from 'react-router-dom';
import Button, { ButtonColor } from '../Button';
import Modal from '../Modal';

interface ProtectedRouteProps {
  noActiveCommunity: boolean;
  children: JSX.Element;
}

const ProtectedRoute = ({ noActiveCommunity, children }: ProtectedRouteProps) => {
  const navigate = useNavigate();

  const noActiveCommunityModalContent = {
    title: 'No Active Community',
    content: (
      <>
        <p>
          Proposal creation can only be done via a community's page. Check for open funding rounds
          on the homepage.
        </p>
        <Button text="Go Home" bgColor={ButtonColor.White} onClick={() => navigate(`/`)} />
      </>
    ),
    onDismiss: () => navigate(`/`),
  };

  if (noActiveCommunity) {
    return <Modal data={noActiveCommunityModalContent} />;
  }

  return children;
};

export default ProtectedRoute;
