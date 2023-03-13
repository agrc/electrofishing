import { describe, expect, it } from 'vitest';
import config from '../../config';
import { validateTransect } from './Habitat.jsx';

const fnT = config.fieldNames.transect;
const fnM = config.fieldNames.transectMeasurements;
describe('validateTransect', () => {
  it('returns true for a validate transect', () => {
    const transect = {
      [fnT.WWID]: 1,
    };
    const measurements = [
      {
        [fnM.DISTANCE_START]: 0.5,
      },
    ];

    expect(validateTransect(transect, measurements)).toBe(true);
  });

  it('returns an info message if wetted width is missing and there is at least one start distance', () => {
    const transect = {
      [fnT.WWID]: null,
    };
    const measurements = [
      {
        [fnM.DISTANCE_START]: 0.5,
      },
    ];

    const result = validateTransect(transect, measurements);

    expect(result.type).toBe('info');
    expect(result.message.toLowerCase()).toMatch(/wetted width does not have a value/);
  });

  it('returns a danger message if any start distance is more than the wetted width', () => {
    const transect = {
      [fnT.WWID]: 2,
    };
    const measurements = [
      {
        [fnM.DISTANCE_START]: 0.5,
      },
      {
        [fnM.DISTANCE_START]: 3,
      },
      {
        [fnM.DISTANCE_START]: 0.5,
      },
    ];

    const result = validateTransect(transect, measurements);

    expect(result.type).toBe('danger');
    expect(result.message.toLowerCase()).toMatch(/distances from starting bank must/);
  });

  it('returns a danger message when wetted width is greater than bankfull width', () => {
    const transect = {
      [fnT.WWID]: 2,
      [fnT.BWID]: 1,
    };
    const measurements = [];

    const result = validateTransect(transect, measurements);

    expect(result.type).toBe('danger');
    expect(result.message.toLowerCase()).toMatch(/wetted width cannot exceed bankfull width/);
  });
});
