import { MeleeWeapon } from "./weapons";
import { Slash, SlashAttacks } from "../attacks/slash";
import { WeaponRegistry } from "./weaponRegistry";

/**
 * Example weapon configurations
 * This file demonstrates how to set up weapons with different attacks
 */

// Custom Sword 1 - Fast slashing weapon
const customSword1 = new MeleeWeapon("fort:custom_sword_1");

customSword1
    .addAttack({
        attack: SlashAttacks.Sword.NormalRange,
        damage: 7
    })
    .addAttack( {
        attack: SlashAttacks.Sword.NormalRange,
        damage: 7
    })
    .addAttack({
        attack: SlashAttacks.Swirl.LongRange,
        damage: 7
    });

// Register the weapon
WeaponRegistry.register(customSword1);

// Register if you have this item
// WeaponRegistry.register(legendaryBlade);

/**
 * Example usage:
 * 
 * const weapon = WeaponRegistry.getWeapon("fort:custom_sword_1");
 * if (weapon) {
 *     // Execute default attack
 *     const hit = weapon.tryExecuteAttack(undefined, attackerPos, attackerForward, targetPos);
 *     
 *     // Execute specific attack
 *     const heavyHit = weapon.tryExecuteAttack("heavy_attack", attackerPos, attackerForward, targetPos);
 *     
 *     // Draw attack effect
 *     weapon.drawAttackEffect("light_attack", dimension, pos, forward);
 * }
 */

export { customSword1 };
