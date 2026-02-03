import { Dimension, EnchantmentType, EnchantmentTypes, Entity, EntityComponentTypes, EntityDamageCause, EntityEquippableComponent, EntityHealthComponent, EntityRaycastHit, EquipmentSlot, ItemComponentTypes, ItemStack, Player, system, Vector3, world } from "@minecraft/server";
import { Vector3Utils } from "./minecraft-math";
import { C } from "../constants";

export interface ArcRotationParams {
  rotAxis: Vector3;
  angleDeg: number;
}

export class CustomMathUtils {
  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }
}

export class CustomVectorUtils {
  
  static createBasisFromForward(forward: Vector3): {
    forward: Vector3;
    right: Vector3;
    up: Vector3;
  } {
    const upWorld = { x: 0, y: 1, z: 0 };
    const right = Vector3Utils.normalize(Vector3Utils.cross(upWorld, forward));
    const up = Vector3Utils.cross(forward, right);
    return { forward, right, up };
  }

  static rotateAroundAxis(v: Vector3, axis: Vector3, angle: number): Vector3 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const dot = v.x * axis.x + v.y * axis.y + v.z * axis.z;
    const crossProd = Vector3Utils.cross(axis, v);

    return {
      x: v.x * cos + crossProd.x * sin + axis.x * dot * (1 - cos),
      y: v.y * cos + crossProd.y * sin + axis.y * dot * (1 - cos),
      z: v.z * cos + crossProd.z * sin + axis.z * dot * (1 - cos),
    };
  }

  static translateRelativeToBasis(
    point: Vector3,
    basis: { forward: Vector3; right: Vector3; up: Vector3 },
    translation: Vector3,
  ): Vector3 {
    return {
      x:
        point.x +
        basis.right.x * translation.x +
        basis.up.x * translation.y +
        basis.forward.x * translation.z,
      y:
        point.y +
        basis.right.y * translation.x +
        basis.up.y * translation.y +
        basis.forward.y * translation.z,
      z:
        point.z +
        basis.right.z * translation.x +
        basis.up.z * translation.y +
        basis.forward.z * translation.z,
    };
  }
}

export class EntityUtils {
  static isAlive(entity: Entity): boolean {
    const healthComp = entity.getComponent(EntityComponentTypes.Health);
    if (healthComp === undefined || !(healthComp instanceof EntityHealthComponent)) return false;
    return true;
  }

  static translateFromHeadLocation(entity: Entity, translation: Vector3, relativeToView: boolean = true): Vector3 {
    const headLocation = entity.getHeadLocation();
    if (relativeToView) {
      const basis = CustomVectorUtils.createBasisFromForward(
        entity.getViewDirection(),
      );
      return CustomVectorUtils.translateRelativeToBasis(
        headLocation,
        basis,
        translation,
      );
    }
    else {
      return {
        x: headLocation.x + translation.x,
        y: headLocation.y + translation.y,
        z: headLocation.z + translation.z,
      };
    }
  }

  static getMainhandItemStack(entity: Entity): ItemStack | undefined {
    const equipmentComp = entity.getComponent(EntityComponentTypes.Equippable);
    if(!(equipmentComp instanceof EntityEquippableComponent)) return undefined;
    return equipmentComp.getEquipment(EquipmentSlot.Mainhand);
  }

  static getValidEntitiesNearby(source: Entity, maxRange: number, minRange: number = 0, relativeOffset?: Vector3): Entity[] {
    const sourcePos = relativeOffset ? EntityUtils.translateFromHeadLocation(source, relativeOffset) : source.location;
    const nearbyEntities = source.dimension.getEntities({
      location: sourcePos,
      maxDistance: maxRange,
      minDistance: minRange,
      excludeFamilies: C.HITEXCLUDEDFAMILIES, 
      excludeTypes: C.HITEXCLUDEDTYPES
    });
    let output: Entity[] = [];
    for(const entity of nearbyEntities) {
      if(entity instanceof Player && C.HITEXCLUDEDGAMEMODES.includes(entity.getGameMode())) continue;
      if(entity === source) continue;
      output.push(entity);
    }
    return output;
  }
  /**Excludes self & excludes creative players */
  static getValidEntitiesFromRayCast(source: Entity, location: Vector3, direction: Vector3, range?: number): EntityRaycastHit[] {
    const entityRaycastHit = source.dimension.getEntitiesFromRay(location, direction, { 
        includeLiquidBlocks: false,
        includePassableBlocks: false,
        maxDistance: range, 
        excludeFamilies: C.HITEXCLUDEDFAMILIES, 
        excludeTypes: C.HITEXCLUDEDTYPES
    });
    let output: EntityRaycastHit[] = [];
    entityRaycastHit.forEach(hit => {
      if(hit.entity instanceof Player && C.HITEXCLUDEDGAMEMODES.includes(hit.entity.getGameMode())) return;
      if(hit.entity !== source) {
          output.push(hit);
      }
    });
    return output;
  }

  /** Deals damage to an entity ignoring hit immunity, possibly ignoring a percentage of armor and protection enchantments */
  static dealDamage(attacker: Entity, receiver: Entity, damage: number, armorIgnorePercent: number = 0, protectionIgnorePercent: number = 0, resistanceIgnorePercent: number = 0): void {
    const healthComp = receiver.getComponent(EntityComponentTypes.Health);
    if(!(healthComp instanceof EntityHealthComponent)) return;
    let finalDamage = damage;

    const adjustedArmorReductionMult = this.#getArmorDamageReductionMult(receiver, damage) * (1 - armorIgnorePercent);
    const adjustedProtectionReductionMult = this.#getProtectionDamageReductionMult(receiver) * (1 - protectionIgnorePercent);
    const adjustedResistanceReductionMult = CustomMathUtils.clamp(this.#getResistanceDamageReductionMult(receiver) * (1 - resistanceIgnorePercent), 0, 1);

    finalDamage *= (1 - adjustedArmorReductionMult);
    finalDamage *= (1 - adjustedProtectionReductionMult);
    finalDamage *= (1 - adjustedResistanceReductionMult);



     //const armorReductionMult = Math.min(80, Math.max(4*totalArmor/5, 4*totalArmor - (16*damage)/(totalToughness+8) )) / 100;
     //const protectionReductionMult = Math.min(totalProtLevel * 4, 20) / 100;
     //finalDamage *= (1 - armorReductionMult);
     //finalDamage *= (1 - protectionReductionMult);

    world.sendMessage(`Dealt ${finalDamage} damage, aR: ${adjustedArmorReductionMult}%, pR: ${adjustedProtectionReductionMult}%, rR: ${adjustedResistanceReductionMult}%`);
    healthComp.setCurrentValue(CustomMathUtils.clamp(healthComp.currentValue - finalDamage, 0, healthComp.currentValue));

    receiver.applyDamage(0.001, {cause: EntityDamageCause.override, damagingEntity: attacker}); //to trigger damage effects without actually dealing damage
    //receiver.applyDamage(damage, {cause: EntityDamageCause.entityAttack, damagingEntity: attacker}); //to trigger damage effects without actually dealing damage
  }


  static #getArmorDamageReductionMult(entity: Entity, damage: number): number {
    const equippableComp = entity.getComponent(EntityComponentTypes.Equippable);
    if (!(equippableComp instanceof EntityEquippableComponent)) return 0;
    const a = equippableComp.totalArmor;
    const t = equippableComp.totalToughness;
    if(a <= 0 && t <= 0) return 0;
    const armorReductionMult = Math.min(80, Math.max(4*a/5, 4*a - (16*damage)/(t+8) )) / 100;
    return armorReductionMult;
  }

  static #getProtectionDamageReductionMult(entity: Entity): number {
    const equippableComp = entity.getComponent(EntityComponentTypes.Equippable);
    if (!(equippableComp instanceof EntityEquippableComponent)) return 0;
    const totalProtLevel = this.#getEnchantmentLevel(equippableComp.getEquipment(EquipmentSlot.Head), EnchantmentTypes.get("minecraft:protection")!)
                          + this.#getEnchantmentLevel(equippableComp.getEquipment(EquipmentSlot.Chest), EnchantmentTypes.get("minecraft:protection")!)
                          + this.#getEnchantmentLevel(equippableComp.getEquipment(EquipmentSlot.Legs), EnchantmentTypes.get("minecraft:protection")!)
                          + this.#getEnchantmentLevel(equippableComp.getEquipment(EquipmentSlot.Feet), EnchantmentTypes.get("minecraft:protection")!);
    if(totalProtLevel <= 0) return 0;
    return Math.min(totalProtLevel * 4, 20) / 100;
  }

  /**Can go over 100% */
  static #getResistanceDamageReductionMult(entity: Entity): number {
    const resistanceLevel = (entity.getEffect("minecraft:resistance")?.amplifier ?? -1)+1;
    return (resistanceLevel * 20) / 100;
  }

  static #getEnchantmentLevel(itemStack: ItemStack | undefined, enchantmentType: EnchantmentType): number {
    if (!itemStack) return 0;
    const enchantableComp = itemStack.getComponent(ItemComponentTypes.Enchantable);
    if (!(enchantableComp)) return 0;
    const enchantment = enchantableComp.getEnchantment(enchantmentType.id);
    if (enchantment === undefined) return 0;
    return enchantment.level;
  }

}

export class DrawEffects {
  static drawRay(
    dimension: Dimension,
    startPos: Vector3,
    direction: Vector3,
    length: number,
    pointsNum: number,
  ) {
    for (let i = 0; i < pointsNum; i++) {
      const t = i / pointsNum;
      dimension.spawnParticle(C.DEBUGPARTICLENAME, {
        x: startPos.x + direction.x * t * length,
        y: startPos.y + direction.y * t * length,
        z: startPos.z + direction.z * t * length,
      });
    }
  }

  static drawArc(
    dimension: Dimension,
    startPos: Vector3,
    direction: Vector3,
    distance: number,
    arcRotation: ArcRotationParams[],
    pointsNum: number,
  ) {
    for (let i = 0; i <= pointsNum; i++) {
      const a =
        -arcRotation[0].angleDeg +
        (i / pointsNum) * (2 * arcRotation[0].angleDeg);
      let dir = CustomVectorUtils.rotateAroundAxis(
        direction,
        arcRotation[0].rotAxis,
        a,
      );
      let r = 1;
      while (arcRotation.length > r) {
        dir = CustomVectorUtils.rotateAroundAxis(
          dir,
          arcRotation[r].rotAxis,
          arcRotation[r].angleDeg,
        );
        r++;
      }

      dimension.spawnParticle(C.DEBUGPARTICLENAME, {
        x: startPos.x + dir.x * distance,
        y: startPos.y + dir.y * distance,
        z: startPos.z + dir.z * distance,
      });
    }
  }
}
