import { describe, expect, test } from 'vitest';
import config from '../../config';
import { CATHODE_TYPES, EQUIPMENT_TYPES, getSideEffects } from './Equipment.jsx';

describe('getSideEffects', () => {
  test('should return an empty object if no changes are needed', () => {
    const changes = getSideEffects('TEST_FIELD', 'newValue');

    expect(changes).toEqual({});
  });

  test('should return empty cathode diameter if type is changed to boat', () => {
    const changes = getSideEffects(config.fieldNames.equipment.CATHODE_TYPE, CATHODE_TYPES.BOAT);

    expect(changes).toEqual({
      [config.fieldNames.equipment.CATHODE_DIAMETER]: null,
    });
  });

  test('clears hidden fields when changing equipment type', () => {
    let changes = getSideEffects(config.fieldNames.equipment.TYPE, EQUIPMENT_TYPES.CANOEBARGE);

    expect(changes).toEqual({
      [config.fieldNames.equipment.ARRAY_TYPE]: null,
    });

    changes = getSideEffects(config.fieldNames.equipment.TYPE, EQUIPMENT_TYPES.BACKPACK);

    expect(changes).toEqual({
      [config.fieldNames.equipment.ARRAY_TYPE]: null,
      [config.fieldNames.equipment.CATHODE_TYPE]: null,
    });
  });
});
