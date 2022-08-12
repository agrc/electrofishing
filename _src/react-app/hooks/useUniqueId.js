import { useRef } from 'react';

export default function useUniqueId() {
  const id = useRef(Symbol());

  return id.current;
}
