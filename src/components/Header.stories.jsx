import { initializeApp } from 'firebase/app';
import Header from './Header.jsx';
import { AppContext } from '../App.jsx';

const story = {
  title: 'Header',
  component: Header,
};
export default story;

initializeApp(JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG));

export const Default = () => (
  <AppContext.Provider value={{ appState: { submitLoading: false }, appDispatch: () => {} }}>
    <Header />
  </AppContext.Provider>
);
