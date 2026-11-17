import { EQUIPMENT, type Equipment } from '../catalogue/equipment';
import { inListOrder } from '../listOrder';
import type { ValidationError } from '../validation';

/** Equipment the Athlete owns that the Catalogue doesn't know. Only Custom Exercises use it. */
export interface CustomEquipment {
  id: string;
  name: string;
}

/** The Equipment the Athlete owns, including any Custom Equipment. */
export interface Inventory {
  equipment: readonly Equipment[];
  customEquipment: readonly CustomEquipment[];
}

export const EMPTY_INVENTORY: Inventory = {
  equipment: [],
  customEquipment: [],
};

export const CUSTOM_EQUIPMENT_NAME_MAX = 40;

/** True when the Athlete owns everything the Exercise requires; bodyweight work always is. */
export function allows(
  inventory: Inventory,
  exercise: { requiredEquipment: readonly Equipment[] },
): boolean {
  return exercise.requiredEquipment.every((item) =>
    inventory.equipment.includes(item),
  );
}

export function withEquipment(
  inventory: Inventory,
  equipment: readonly Equipment[],
): Inventory {
  return { ...inventory, equipment: inListOrder(EQUIPMENT, equipment) };
}

const comparable = (name: string) => name.trim().toLocaleLowerCase();

/**
 * Checks a Custom Equipment name against the Athlete's others. `ownId` is the item being
 * renamed, which may keep its own name.
 */
export function checkCustomEquipmentName(
  name: string,
  existing: readonly CustomEquipment[],
  ownId?: string,
): ValidationError | undefined {
  const trimmed = name.trim();
  if (trimmed === '') return 'required';
  if (trimmed.length > CUSTOM_EQUIPMENT_NAME_MAX) return 'tooHigh';
  const taken = existing.some(
    (item) =>
      item.id !== ownId && comparable(item.name) === comparable(trimmed),
  );
  return taken ? 'duplicate' : undefined;
}

/** Adds a Custom Equipment; the caller checks the name and supplies a new id. */
export function addCustomEquipment(
  inventory: Inventory,
  id: string,
  name: string,
): Inventory {
  return {
    ...inventory,
    customEquipment: [...inventory.customEquipment, { id, name: name.trim() }],
  };
}

export function renameCustomEquipment(
  inventory: Inventory,
  id: string,
  name: string,
): Inventory {
  return {
    ...inventory,
    customEquipment: inventory.customEquipment.map((item) =>
      item.id === id ? { ...item, name: name.trim() } : item,
    ),
  };
}

export function removeCustomEquipment(
  inventory: Inventory,
  id: string,
): Inventory {
  return {
    ...inventory,
    customEquipment: inventory.customEquipment.filter((item) => item.id !== id),
  };
}
