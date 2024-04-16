import Health from './Health.jsx';

const story = {
  title: 'Health',
  component: Health,
};

export default story;

export const Default = () => <Health state={{ EYE: 'test' }} onChange={() => {}} />;
