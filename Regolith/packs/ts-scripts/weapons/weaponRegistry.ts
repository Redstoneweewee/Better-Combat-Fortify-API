import { ItemStack } from "@minecraft/server";
import { MeleeWeapon } from "./weapons";

/**
 * Registry to manage all weapons
 */
export class WeaponRegistry {
    static weapons: Map<string, MeleeWeapon> = new Map();

    /**
     * Register a weapon
     */
    static register(weapon: MeleeWeapon): void {
        this.weapons.set(weapon.itemTypeId, weapon);
    }

    /**
     * Get a weapon by item type ID
     */
    static getWeapon(itemTypeId: string): MeleeWeapon | undefined {
        return this.weapons.get(itemTypeId);
    }

    /**
     * Get a weapon from an item stack
     */
    static getWeaponFromItem(item: ItemStack): MeleeWeapon | undefined {
        return this.weapons.get(item.typeId);
    }

    /**
     * Check if an item is a registered weapon
     */
    static isWeapon(itemStack: ItemStack | undefined): boolean {
        if (itemStack === undefined) return false;
        return this.weapons.has(itemStack.typeId);
    }

    /**
     * Get all registered weapons
     */
    static getAllWeapons(): MeleeWeapon[] {
        return Array.from(this.weapons.values());
    }
}
