import { Helmet } from 'react-helmet';

export interface MetaDecoratorProps {
  title: string;
  description: string;
}

const MetaDecorator = ({ title, description }: MetaDecoratorProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
    </Helmet>
  );
};

export default MetaDecorator;
