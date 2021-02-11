import * as React from 'react';
import VerifyMap from './VerifyMap';

export default {
  title: 'VerifyMap',
};

export const Default = () => (
  <div style={{ height: '400px', width: '400px' }}>
    <VerifyMap />
  </div>
);
export const MainMap = () => (
  <div style={{ height: '400px', width: '400px' }}>
    <VerifyMap isMainMap={true} />
  </div>
);
