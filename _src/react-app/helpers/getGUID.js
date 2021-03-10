import { v4 as uuid } from 'uuid';

export default function getGUID() {
  return `{${uuid()}}`.toUpperCase();
}
