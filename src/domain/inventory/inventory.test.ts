import { describe, expect, it } from 'vitest';
import {
  addCustomEquipment,
  allows,
  checkCustomEquipmentName,
  EMPTY_INVENTORY,
  removeCustomEquipment,
  renameCustomEquipment,
  withEquipment,
  type Inventory,
} from './inventory';

const inventory: Inventory = {
  equipment: ['dumbbells', 'pullUpBar'],
  customEquipment: [{ id: 'trx', name: 'TRX strap' }],
};

describe('allows', () => {
  it('always allows bodyweight Exercises, even with no Equipment', () => {
    expect(allows(EMPTY_INVENTORY, { requiredEquipment: [] })).toBe(true);
  });

  it('allows an Exercise only when every required Equipment is owned', () => {
    expect(allows(inventory, { requiredEquipment: ['dumbbells'] })).toBe(true);
    expect(
      allows(inventory, { requiredEquipment: ['dumbbells', 'bench'] }),
    ).toBe(false);
  });
});

describe('withEquipment', () => {
  it('keeps owned Equipment in list order without duplicates', () => {
    expect(
      withEquipment(EMPTY_INVENTORY, ['pullUpBar', 'dumbbells', 'pullUpBar'])
        .equipment,
    ).toEqual(['dumbbells', 'pullUpBar']);
  });
});

describe('Custom Equipment', () => {
  it('adds, renames and removes Custom Equipment', () => {
    const added = addCustomEquipment(inventory, 'vest', '  Weighted vest ');
    expect(added.customEquipment).toEqual([
      { id: 'trx', name: 'TRX strap' },
      { id: 'vest', name: 'Weighted vest' },
    ]);
    expect(
      renameCustomEquipment(added, 'trx', 'Suspension trainer')
        .customEquipment[0],
    ).toEqual({
      id: 'trx',
      name: 'Suspension trainer',
    });
    expect(removeCustomEquipment(added, 'trx').customEquipment).toEqual([
      { id: 'vest', name: 'Weighted vest' },
    ]);
  });

  it('requires a name of at most 40 characters', () => {
    expect(checkCustomEquipmentName('   ', [])).toBe('required');
    expect(checkCustomEquipmentName('x'.repeat(41), [])).toBe('tooHigh');
    expect(checkCustomEquipmentName('x'.repeat(40), [])).toBeUndefined();
  });

  it('refuses a name already used, ignoring case and spaces', () => {
    expect(
      checkCustomEquipmentName(' trx STRAP ', inventory.customEquipment),
    ).toBe('duplicate');
  });

  it('lets an item keep its own name when renamed', () => {
    expect(
      checkCustomEquipmentName('TRX strap', inventory.customEquipment, 'trx'),
    ).toBeUndefined();
  });
});
