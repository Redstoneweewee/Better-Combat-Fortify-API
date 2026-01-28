import { Dimension, Entity, EntityComponentTypes, EntityEquippableComponent, EntityHealthComponent, EntityRaycastHit, EquipmentSlot, ItemStack, Player, Vector3 } from "@minecraft/server";
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
