import React from 'react';
import config from '../../config';
import Tag from './Tag';

const story = {
  title: 'Tag',
  component: Tag,
};

export default story;

const fn = config.fieldNames.tags;
export const Default = () => {
  const [state, setState] = React.useState({
    [fn.FISH_ID]: 'asdf',
    [fn.NUMBER]: 'asdf',
    [fn.TRANSPONDER_FREQ]: 'freq',
    [fn.TRANSMITTER_FREQ]: 'freq',
    [fn.TRANSMITTER_FREQ_TYPE]: 'type',
    [fn.TYPE]: 'types',
    [fn.LOCATION]: 'location',
    [fn.COLOR]: 'color',
    [fn.NEW_TAG]: 'new',
  });

  return <Tag state={state} onChange={setState} isLast={true} />;
};
