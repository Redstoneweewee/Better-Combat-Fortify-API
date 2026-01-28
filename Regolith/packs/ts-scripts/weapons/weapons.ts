import { Entity, EntityDamageCause, ItemStack, Player, system, Vector3 } from "@minecraft/server";
import { Slash } from "../attacks/slash";
import { IAttack } from "../attacks/attack";
import { EntityUtils } from "../utils/utils";
import { C } from "../constants";

/**
 * Configuration for a weapon's attack
 */
export interface WeaponAttackConfig {
    attack: IAttack;
    damage: number;
}

export interface WeaponAttackExecutionResult {
    executed: boolean;
    hit: boolean;
    effectDrawn: boolean;
    cooldownTime?: number;
}

class WeaponCooldown {
    currentTick: number;
    cooldownAmount: number;

    constructor(currentTick: number, cooldownAmount: number) {
        this.currentTick = currentTick;
        this.cooldownAmount = cooldownAmount;
    }

    isOnCooldown(): boolean {
        return this.currentTick + this.cooldownAmount >= system.currentTick;
    }
    getCooldownTime(): number {
        const timeLeft = (this.currentTick + this.cooldownAmount) - system.currentTick;
        return timeLeft > 0 ? timeLeft : 0;
    }
    setNewCooldown(cooldownAmount: number): void {
        this.currentTick = system.currentTick;
        this.cooldownAmount = cooldownAmount;
    }
}

/**
 * Weapon class that associates item types with their attack configurations
 */
export class MeleeWeapon {
    itemTypeId: string;
    attacks: WeaponAttackConfig[];
    currentAttackIndex: number = 0;
    weaponCooldown: WeaponCooldown = new WeaponCooldown(0, 0);
    resetAttackIndexIntervalId: number | undefined = undefined;

    constructor(itemTypeId: string) {
        this.itemTypeId = itemTypeId;
        this.attacks = [];
    }

    /**
     * Add an attack configuration to this weapon
     * @param name - Unique identifier for this attack (e.g., "light_attack", "heavy_attack")
     * @param config - Attack configuration
     */
    addAttack(config: WeaponAttackConfig): this {
        this.attacks.push(config);
        return this;
    }

    /**
     * Get the current attack
     */
    getCurrentAttack(): WeaponAttackConfig | undefined {
        return this.attacks[this.currentAttackIndex];
    }

    /**
     * Execute an attack if not on cooldown
     * @param attacker - Entity performing the attack
     * @param target - Target entity
     * @returns Whether the attack hit
     */
    tryExecuteAttack(attacker: Entity, drawEffect: boolean): WeaponAttackExecutionResult {
        if(this.weaponCooldown.isOnCooldown()) return { executed: false, hit: false, effectDrawn: false, cooldownTime: this.weaponCooldown.getCooldownTime() };

        let hit = false;
        const attackConfig = this.getCurrentAttack();
        if (!attackConfig) {
            console.warn("No attack configuration found for weapon:", this.itemTypeId);
            return { executed: false, hit: false, effectDrawn: false };
        }

        const possibleTargets = EntityUtils.getValidEntitiesNearby(attacker, attackConfig.attack.maxRange, attackConfig.attack.minRange, attackConfig.attack.attackOffset);

        for(const target of possibleTargets) {
            if(attackConfig.attack.isHit(attacker.getHeadLocation(), attacker.getViewDirection(), {x: target.getHeadLocation().x, y: (target.getHeadLocation().y+target.location.y)/2, z: target.getHeadLocation().z})) {
                target.applyDamage(attackConfig.damage, {cause: attackConfig.attack.attackType, damagingEntity: attacker});
                hit = true;
            }
        }
        if(drawEffect) this.drawAttackEffect(attacker);

        this.weaponCooldown.setNewCooldown(attackConfig.attack.cooldown);
        if(attacker instanceof Player) attacker.startItemCooldown(this.itemTypeId, attackConfig.attack.cooldown);
        this.incrementAttackIndex();
        if(this.resetAttackIndexIntervalId !== undefined) system.clearRun(this.resetAttackIndexIntervalId);
        this.resetAttackIndexIntervalId = system.runTimeout(() => { this.resetAttackIndex(); }, C.RESETCOMBOTICKS);
        return { executed: true, hit: hit, effectDrawn: drawEffect };
    }

    incrementAttackIndex(): void {
        this.currentAttackIndex = (this.currentAttackIndex + 1) % this.attacks.length;
    }
    resetAttackIndex(): void {
        this.currentAttackIndex = 0;
    }

    /**
     * Draw attack effects if not on cooldown
     * @param attacker - Entity performing the attack
     */
    drawAttackEffect(attacker: Entity): void {
        const attackConfig = this.getCurrentAttack();
        if (!attackConfig || !attackConfig.attack.drawEffect) return;
        const dimension = attacker.dimension;
        const pos = attacker.getHeadLocation();
        const forward = attacker.getViewDirection();

        attackConfig.attack.drawEffect(dimension, pos, forward);
    }
}