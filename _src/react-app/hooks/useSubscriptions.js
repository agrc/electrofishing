import * as React from 'react';
import pubSub from 'pubsub-js';

export default function useSubscriptions() {
  const tokens = React.useRef([]);

  React.useEffect(() => {
    return () => {
      console.log('cleaning up tokens');
      tokens.forEach(pubSub.unsubscribe);
    };
  }, []);

  return (token) => {
    tokens.current.push(token);
  };
}
