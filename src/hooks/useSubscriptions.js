import * as React from 'react';
import pubSub from 'pubsub-js';

export default function useSubscriptions() {
  const tokens = React.useRef({});

  React.useEffect(() => {
    const tokensRef = tokens.current;

    return () => {
      console.log('cleaning up subscriptions');

      for (const key in tokensRef) {
        pubSub.unsubscribe(tokensRef[key]);
      }
    };
  }, []);

  return (topic, callback) => {
    if (tokens.current[topic]) {
      pubSub.unsubscribe(tokens.current[topic]);
    }

    tokens.current[topic] = pubSub.subscribe(topic, callback);
  };
}
