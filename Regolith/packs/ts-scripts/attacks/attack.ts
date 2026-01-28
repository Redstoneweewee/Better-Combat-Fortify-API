import { EntityDamageCause, Vector3 } from "@minecraft/server";

/**
 * Base interface for all attack types
 */
export interface IAttack {

    maxRange: number;
    minRange: number;
    cooldown: number;
    attackOffset: Vector3;
    attackType: EntityDamageCause;

    /** Execute hit detection for this attack */
    isHit(attackerPos: Vector3, attackerForward: Vector3, targetPos: Vector3): boolean;
    /** Draw visual effects for this attack */
    drawEffect?(dimension: any, pos: Vector3, forward: Vector3, numOfParticles?: number): void;
}
