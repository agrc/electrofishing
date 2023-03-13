import { debounce } from 'lodash';
import React from 'react';

// inspired by: https://www.developerway.com/posts/debouncing-in-react#part3
export default function useDebounce(callback, delay) {
  const ref = React.useRef();

  React.useEffect(() => {
    ref.current = callback;
  }, [callback]);

  const debouncedCallback = React.useMemo(() => {
    const func = (...args) => {
      ref.current(...args);
    };

    return debounce(func, delay);
  }, [delay]);

  return debouncedCallback;
}
