import Helmet from 'react-helmet';

const OpenGraphElements: React.FC<{
  title: string;
  description: string;
  imageUrl: string;
}> = props => {
  const { title, description, imageUrl } = props;
  return (
    <Helmet>
      {/* <!-- Open Graph / Facebook --> */}
      <meta property="og:url" content={'https://prop.house'} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      {/* <!-- Twitter --> */}
      <meta property="twitter:url" content={'https://prop.house'} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  );
};
export default OpenGraphElements;
