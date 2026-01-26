// ../Regolith/packs/ts-scripts/utils/minecraft-math.js
import { BlockVolume } from "@minecraft/server";
function clampNumber(val, min, max) {
  return Math.min(Math.max(val, min), max);
}
var Vector3Utils = class _Vector3Utils {
  /**
   * equals
   *
   * Check the equality of two vectors
   */
  static equals(v1, v2) {
    return v1.x === v2.x && v1.y === v2.y && v1.z === v2.z;
  }
  /**
   * add
   *
   * Add two vectors to produce a new vector
   */
  static add(v1, v2) {
    return { x: v1.x + (v2.x ?? 0), y: v1.y + (v2.y ?? 0), z: v1.z + (v2.z ?? 0) };
  }
  /**
   * subtract
   *
   * Subtract two vectors to produce a new vector (v1-v2)
   */
  static subtract(v1, v2) {
    return { x: v1.x - (v2.x ?? 0), y: v1.y - (v2.y ?? 0), z: v1.z - (v2.z ?? 0) };
  }
  /** scale
   *
   * Multiple all entries in a vector by a single scalar value producing a new vector
   */
  static scale(v1, scale) {
    return { x: v1.x * scale, y: v1.y * scale, z: v1.z * scale };
  }
  /**
   * dot
   *
   * Calculate the dot product of two vectors
   */
  static dot(a, b) {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }
  /**
   * cross
   *
   * Calculate the cross product of two vectors. Returns a new vector.
   */
  static cross(a, b) {
    return { x: a.y * b.z - a.z * b.y, y: a.z * b.x - a.x * b.z, z: a.x * b.y - a.y * b.x };
  }
  /**
   * magnitude
   *
   * The magnitude of a vector
   */
  static magnitude(v) {
    return Math.sqrt(v.x ** 2 + v.y ** 2 + v.z ** 2);
  }
  /**
   * distance
   *
   * Calculate the distance between two vectors
   */
  static distance(a, b) {
    return _Vector3Utils.magnitude(_Vector3Utils.subtract(a, b));
  }
  /**
   * normalize
   *
   * Takes a vector 3 and normalizes it to a unit vector
   */
  static normalize(v) {
    const mag = _Vector3Utils.magnitude(v);
    return { x: v.x / mag, y: v.y / mag, z: v.z / mag };
  }
  /**
   * floor
   *
   * Floor the components of a vector to produce a new vector
   */
  static floor(v) {
    return { x: Math.floor(v.x), y: Math.floor(v.y), z: Math.floor(v.z) };
  }
  /**
   * ceil
   *
   * Ceil the components of a vector to produce a new vector
   */
  static ceil(v) {
    return { x: Math.ceil(v.x), y: Math.ceil(v.y), z: Math.ceil(v.z) };
  }
  /**
   * min
   *
   * Min the components of two vectors to produce a new vector
   */
  static min(a, b) {
    return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y), z: Math.min(a.z, b.z) };
  }
  /**
   * max
   *
   * Max the components of two vectors to produce a new vector
   */
  static max(a, b) {
    return { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y), z: Math.max(a.z, b.z) };
  }
  /**
   * toString
   *
   * Create a string representation of a vector3
   */
  static toString(v, options) {
    const decimals = options?.decimals ?? 2;
    const str = [v.x.toFixed(decimals), v.y.toFixed(decimals), v.z.toFixed(decimals)];
    return str.join(options?.delimiter ?? ", ");
  }
  /**
   * fromString
   *
   * Gets a Vector3 from the string representation produced by {@link Vector3Utils.toString}. If any numeric value is not a number
   * or the format is invalid, undefined is returned.
   * @param str - The string to parse
   * @param delimiter - The delimiter used to separate the components. Defaults to the same as the default for {@link Vector3Utils.toString}
   */
  static fromString(str, delimiter = ",") {
    const parts = str.split(delimiter);
    if (parts.length !== 3) {
      return void 0;
    }
    const output = parts.map((part) => parseFloat(part));
    if (output.some((part) => isNaN(part))) {
      return void 0;
    }
    return { x: output[0], y: output[1], z: output[2] };
  }
  /**
   * clamp
   *
   * Clamps the components of a vector to limits to produce a new vector
   */
  static clamp(v, limits) {
    return {
      x: clampNumber(v.x, limits?.min?.x ?? Number.MIN_SAFE_INTEGER, limits?.max?.x ?? Number.MAX_SAFE_INTEGER),
      y: clampNumber(v.y, limits?.min?.y ?? Number.MIN_SAFE_INTEGER, limits?.max?.y ?? Number.MAX_SAFE_INTEGER),
      z: clampNumber(v.z, limits?.min?.z ?? Number.MIN_SAFE_INTEGER, limits?.max?.z ?? Number.MAX_SAFE_INTEGER)
    };
  }
  /**
   * lerp
   *
   * Constructs a new vector using linear interpolation on each component from two vectors.
   */
  static lerp(a, b, t) {
    return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t, z: a.z + (b.z - a.z) * t };
  }
  /**
   * slerp
   *
   * Constructs a new vector using spherical linear interpolation on each component from two vectors.
   */
  static slerp(a, b, t) {
    const theta = Math.acos(_Vector3Utils.dot(a, b));
    const sinTheta = Math.sin(theta);
    const ta = Math.sin((1 - t) * theta) / sinTheta;
    const tb = Math.sin(t * theta) / sinTheta;
    return _Vector3Utils.add(_Vector3Utils.scale(a, ta), _Vector3Utils.scale(b, tb));
  }
  /**
   * multiply
   *
   * Element-wise multiplication of two vectors together.
   * Not to be confused with {@link Vector3Utils.dot} product or {@link Vector3Utils.cross} product
   */
  static multiply(a, b) {
    return { x: a.x * b.x, y: a.y * b.y, z: a.z * b.z };
  }
  /**
   * rotateX
   *
   * Rotates the vector around the x axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateX(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x, y: v.y * cos - v.z * sin, z: v.z * cos + v.y * sin };
  }
  /**
   * rotateY
   *
   * Rotates the vector around the y axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateY(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x * cos + v.z * sin, y: v.y, z: v.z * cos - v.x * sin };
  }
  /**
   * rotateZ
   *
   * Rotates the vector around the z axis counterclockwise (left hand rule)
   * @param a - Angle in radians
   */
  static rotateZ(v, a) {
    const cos = Math.cos(a);
    const sin = Math.sin(a);
    return { x: v.x * cos - v.y * sin, y: v.y * cos + v.x * sin, z: v.z };
  }
};

// ../Regolith/packs/ts-scripts/utils/utils.ts
import { EntityComponentTypes, EntityEquippableComponent, EntityHealthComponent, EquipmentSlot, Player } from "@minecraft/server";

// ../Regolith/packs/ts-scripts/constants.ts
import { GameMode } from "@minecraft/server";
var C = class {
  static NAMESPACE = "fort:";
  /**World Dynamic Property IDs for linked entities */
  static NONPERSISTENTDPNAME = "nonpersistent_linked_entities";
  //non-persistent linked entities world dynamic property name
  static PERSISTENTDPNAME = "persistent_linked_entities";
  //persistent linked entities world dynamic property name
  /**Interval Names */
  static HITTESTINTERVALNAME = "hitTestInterval";
  /**Particles */
  static DEBUGPARTICLENAME = "minecraft:basic_flame_particle";
  /**Entities */
  static HITDETECTENTITYNAME = "fort:hit_detect_entity";
  /**Hit Test */
  static HITEXCLUDEDFAMILIES = ["minecraft:inanimate", "minecraft:projectile", "inanimate"];
  static HITEXCLUDEDGAMEMODES = [GameMode.creative, GameMode.spectator];
  static HITEXCLUDEDTYPES = [
    "minecraft:item",
    "minecraft:snowball",
    "minecraft:arrow",
    "minecraft:tnt",
    "minecraft:egg",
    "minecraft:ender_pearl",
    "minecraft:fireworks_rocket",
    "minecraft:fireball",
    "minecraft:dragon_fireball",
    "minecraft:small_fireball",
    "minecraft:evocation_fang",
    "minecraft:eye_of_ender_signal",
    "minecraft:falling_block",
    "minecraft:fishing_hook"
  ];
  /**Hit Ranges */
  static BLOCKPLACERANGE = 5.2;
  static CREATIVEHITRANGE = 6;
  static SURVIVALHITRANGE = 3.3;
};

// ../Regolith/packs/ts-scripts/utils/utils.ts
var CustomMathUtils = class {
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }
};
var CustomVectorUtils = class {
  static createBasisFromForward(forward) {
    const upWorld = { x: 0, y: 1, z: 0 };
    const right = Vector3Utils.normalize(Vector3Utils.cross(upWorld, forward));
    const up = Vector3Utils.cross(forward, right);
    return { forward, right, up };
  }
  static rotateAroundAxis(v, axis, angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dot = v.x * axis.x + v.y * axis.y + v.z * axis.z;
    const crossProd = Vector3Utils.cross(axis, v);
    return {
      x: v.x * cos + crossProd.x * sin + axis.x * dot * (1 - cos),
      y: v.y * cos + crossProd.y * sin + axis.y * dot * (1 - cos),
      z: v.z * cos + crossProd.z * sin + axis.z * dot * (1 - cos)
    };
  }
  static translateRelativeToBasis(point, basis, translation) {
    return {
      x: point.x + basis.right.x * translation.x + basis.up.x * translation.y + basis.forward.x * translation.z,
      y: point.y + basis.right.y * translation.x + basis.up.y * translation.y + basis.forward.y * translation.z,
      z: point.z + basis.right.z * translation.x + basis.up.z * translation.y + basis.forward.z * translation.z
    };
  }
};
var EntityUtils = class {
  static isAlive(entity) {
    const healthComp = entity.getComponent(EntityComponentTypes.Health);
    if (healthComp === void 0 || !(healthComp instanceof EntityHealthComponent)) return false;
    return true;
  }
  static translateFromHeadLocation(entity, translation, relativeToView = true) {
    const headLocation = entity.getHeadLocation();
    if (relativeToView) {
      const basis = CustomVectorUtils.createBasisFromForward(
        entity.getViewDirection()
      );
      return CustomVectorUtils.translateRelativeToBasis(
        headLocation,
        basis,
        translation
      );
    } else {
      return {
        x: headLocation.x + translation.x,
        y: headLocation.y + translation.y,
        z: headLocation.z + translation.z
      };
    }
  }
  static getMainhandItemStack(entity) {
    const equipmentComp = entity.getComponent(EntityComponentTypes.Equippable);
    if (!(equipmentComp instanceof EntityEquippableComponent)) return void 0;
    return equipmentComp.getEquipment(EquipmentSlot.Mainhand);
  }
  static getValidEntitiesNearby(source, range) {
    const sourcePos = source.location;
    const nearbyEntities = source.dimension.getEntities({
      location: sourcePos,
      maxDistance: range,
      excludeFamilies: C.HITEXCLUDEDFAMILIES,
      excludeTypes: C.HITEXCLUDEDTYPES
    });
    let output = [];
    for (const entity of nearbyEntities) {
      if (entity instanceof Player && C.HITEXCLUDEDGAMEMODES.includes(entity.getGameMode())) continue;
      if (entity === source) continue;
      output.push(entity);
    }
    return output;
  }
  /**Excludes self & excludes creative players */
  static getValidEntitiesFromRayCast(source, location, direction, range) {
    const entityRaycastHit = source.dimension.getEntitiesFromRay(location, direction, {
      includeLiquidBlocks: false,
      includePassableBlocks: false,
      maxDistance: range,
      excludeFamilies: C.HITEXCLUDEDFAMILIES,
      excludeTypes: C.HITEXCLUDEDTYPES
    });
    let output = [];
    entityRaycastHit.forEach((hit) => {
      if (hit.entity instanceof Player && C.HITEXCLUDEDGAMEMODES.includes(hit.entity.getGameMode())) return;
      if (hit.entity !== source) {
        output.push(hit);
      }
    });
    return output;
  }
};
var DrawEffects = class {
  static drawRay(dimension, startPos, direction, length, pointsNum) {
    for (let i = 0; i < pointsNum; i++) {
      const t = i / pointsNum;
      dimension.spawnParticle(C.DEBUGPARTICLENAME, {
        x: startPos.x + direction.x * t * length,
        y: startPos.y + direction.y * t * length,
        z: startPos.z + direction.z * t * length
      });
    }
  }
  static drawArc(dimension, startPos, direction, distance, arcRotation, pointsNum) {
    for (let i = 0; i <= pointsNum; i++) {
      const a = -arcRotation[0].angleDeg + i / pointsNum * (2 * arcRotation[0].angleDeg);
      let dir = CustomVectorUtils.rotateAroundAxis(
        direction,
        arcRotation[0].rotAxis,
        a
      );
      let r = 1;
      while (arcRotation.length > r) {
        dir = CustomVectorUtils.rotateAroundAxis(
          dir,
          arcRotation[r].rotAxis,
          arcRotation[r].angleDeg
        );
        r++;
      }
      dimension.spawnParticle(C.DEBUGPARTICLENAME, {
        x: startPos.x + dir.x * distance,
        y: startPos.y + dir.y * distance,
        z: startPos.z + dir.z * distance
      });
    }
  }
};

// ../Regolith/packs/ts-scripts/attacks/slash.ts
var Slash = class {
  attackRadius;
  totalHorizontalAngleDeg;
  totalVerticalAngleDeg;
  /** Offset from the attack position `{x: left-right, y: up-down, z: forward-backward}`*/
  attackOffset;
  constructor(attackRadius, totalHorizontalAngleDeg, totalVerticalAngleDeg, attackOffset) {
    this.attackRadius = attackRadius;
    this.totalHorizontalAngleDeg = totalHorizontalAngleDeg;
    this.totalVerticalAngleDeg = totalVerticalAngleDeg;
    this.attackOffset = attackOffset ? attackOffset : { x: 0, y: 0, z: 0 };
  }
  drawSlashEffect(dimension, pos, forward, numOfParticles) {
    const halfH = this.totalHorizontalAngleDeg * Math.PI / 360;
    const halfV = this.totalVerticalAngleDeg * Math.PI / 360;
    const basis = CustomVectorUtils.createBasisFromForward(forward);
    const right = basis.right, up = basis.up;
    const worldOffset = Vector3Utils.add(
      Vector3Utils.add(
        Vector3Utils.scale(right, this.attackOffset.x),
        Vector3Utils.scale(up, this.attackOffset.y)
      ),
      Vector3Utils.scale(forward, this.attackOffset.z)
    );
    pos = Vector3Utils.add(pos, worldOffset);
    const particlesNum = numOfParticles ? numOfParticles : 3 * this.attackRadius;
    const leftVector = CustomVectorUtils.rotateAroundAxis(forward, up, halfH);
    const rightVector = CustomVectorUtils.rotateAroundAxis(forward, up, -halfH);
    const leftUpVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, halfV);
    const leftDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, -halfV);
    const rightUpVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, halfV);
    const rightDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, -halfV);
    DrawEffects.drawRay(dimension, pos, leftUpVector, this.attackRadius, particlesNum);
    DrawEffects.drawRay(dimension, pos, leftDownVector, this.attackRadius, particlesNum);
    DrawEffects.drawRay(dimension, pos, rightUpVector, this.attackRadius, particlesNum);
    DrawEffects.drawRay(dimension, pos, rightDownVector, this.attackRadius, particlesNum);
    DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{ rotAxis: up, angleDeg: halfH }], particlesNum);
    DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{ rotAxis: right, angleDeg: halfV }], particlesNum);
    DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{ rotAxis: up, angleDeg: halfH }, { rotAxis: right, angleDeg: -halfV }], particlesNum);
    DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{ rotAxis: up, angleDeg: halfH }, { rotAxis: right, angleDeg: halfV }], particlesNum);
    DrawEffects.drawArc(dimension, pos, leftVector, this.attackRadius, [{ rotAxis: right, angleDeg: -halfV }], particlesNum);
    DrawEffects.drawArc(dimension, pos, rightVector, this.attackRadius, [{ rotAxis: right, angleDeg: halfV }], particlesNum);
  }
};
var SlashAttacks = {
  QuickSlash: new Slash(3, 120, 30),
  WideSlash: new Slash(4, 180, 45),
  Overhead: new Slash(3.5, 90, 60),
  Spin: new Slash(3.5, 360, 60),
  Thrust: new Slash(2, 30, 20)
};

// ../Regolith/packs/ts-scripts/utils/interval.ts
import { system } from "@minecraft/server";
var Interval;
((Interval2) => {
  class MainInterval {
    name;
    function;
    tickInterval;
    initialTimeout = 0;
    startTick;
    constructor(name, func, tickInterval, initialTimeout = 0) {
      this.name = name;
      this.function = func;
      this.tickInterval = tickInterval;
      this.initialTimeout = initialTimeout;
      this.startTick = system.currentTick + this.initialTimeout;
    }
  }
  Interval2.MainInterval = MainInterval;
  let ArrayPlacement;
  ((ArrayPlacement2) => {
    ArrayPlacement2[ArrayPlacement2["Before"] = 0] = "Before";
    ArrayPlacement2[ArrayPlacement2["After"] = 1] = "After";
  })(ArrayPlacement = Interval2.ArrayPlacement || (Interval2.ArrayPlacement = {}));
  const intervals = [];
  function addInterval(interval, placement = { placement: 1 /* After */ }) {
    if (placement.relativeToIntervalName === void 0) {
      if (placement.placement === 1 /* After */) {
        intervals.push(interval);
      } else {
        intervals.unshift(interval);
      }
    } else {
      const index = intervals.findIndex((i) => i.name === placement.relativeToIntervalName);
      if (index === -1) {
        console.warn(`Interval with name ${placement.relativeToIntervalName} not found. Adding to end of intervals array.`);
        intervals.push(interval);
      } else {
        intervals.splice(index, 0, interval);
      }
    }
  }
  Interval2.addInterval = addInterval;
  let started = false;
  function start() {
    if (started) return;
    started = true;
    system.runInterval(() => {
      const currentTick = system.currentTick;
      intervals.forEach((interval) => {
        if (currentTick >= interval.startTick && (currentTick - interval.startTick) % interval.tickInterval === 0) {
          interval.function();
        }
      });
    }, 1);
  }
  Interval2.start = start;
})(Interval || (Interval = {}));

// ../Regolith/packs/ts-scripts/scriptEvents.ts
import { system as system2, world } from "@minecraft/server";
system2.afterEvents.scriptEventReceive.subscribe((eventData) => {
  const id = eventData.id;
  const message = eventData.message;
  if (id === "fort:transform_offset") {
    const lowerCase = message.toLowerCase();
    const type1 = lowerCase[0];
    const direction = lowerCase[1];
    const type2 = lowerCase[2];
    let amount = Number(lowerCase.match(/\d+/) ?? [][0]);
    if (type2 === "-") {
      amount = -1 * amount;
    }
    if (lowerCase === "toggle") {
      const value = !Boolean(world.getDynamicProperty("fort:transform_offset_apply_to_players"));
      world.setDynamicProperty("fort:transform_offset_apply_to_players", value);
      if (!value) {
        world.sendMessage("Transform Offsets Apply to armor stands");
      } else {
        world.sendMessage("Transform Offsets Apply to players only");
      }
      return;
    } else if (lowerCase.includes("mul")) {
      world.setDynamicProperty("fort:transform_offset_multiply", amount > 0 ? amount : 1);
      world.sendMessage(`Set Transform Offset Multiply to ${amount > 0 ? amount : 1}`);
      return;
    }
    if (world.getDynamicProperty("fort:transform_offset_apply_to_players")) {
      world.getAllPlayers().forEach((player) => {
        offset(player, lowerCase, type1, direction, type2, amount);
      });
    } else {
      world.getAllPlayers().forEach((player) => {
        const entities = player?.dimension.getEntities({
          type: "minecraft:armor_stand",
          location: player?.location,
          maxDistance: 15
        });
        entities.forEach((entity) => {
          offset(entity, lowerCase, type1, direction, type2, amount);
        });
      });
    }
  }
});
function offset(entity, lowerCase, type1, direction, type2, amount) {
  const mult = Number(world.getDynamicProperty("fort:transform_offset_multiply")) ?? 1;
  if (lowerCase === "read") {
    const offsets = {
      rx: 0,
      ry: 0,
      rz: 0,
      tx: 0,
      ty: 0,
      tz: 0,
      sc: 0
    };
    offsets.rx = Number(entity.getProperty("fort:rotation_offset_x"));
    offsets.ry = Number(entity.getProperty("fort:rotation_offset_y"));
    offsets.rz = Number(entity.getProperty("fort:rotation_offset_z"));
    offsets.tx = Number(entity.getProperty("fort:transform_offset_x"));
    offsets.ty = Number(entity.getProperty("fort:transform_offset_y"));
    offsets.tz = Number(entity.getProperty("fort:transform_offset_z"));
    offsets.sc = Number(entity.getProperty("fort:scale_offset"));
    const message = `rotation offset x:  ${offsets.rx}
rotation offset y:  ${offsets.ry}
rotation offset z:  ${offsets.rz}
transform offset x: ${offsets.tx}
transform offset y: ${offsets.ty}
transform offset z: ${offsets.tz}
scale offset:       ${offsets.sc}`;
    world.sendMessage(message);
  }
  if (type1 === "s" && direction === "c") {
    const oldAmount = Number(entity.getProperty("fort:scale_offset"));
    if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
      return;
    }
    entity.setProperty("fort:scale_offset", oldAmount + amount * mult);
    world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${type1 + direction}, type: ${type2}, amount: ${amount}`);
  } else if (type2 !== "s") {
    if (type1 === "r" && direction === "x") {
      const oldAmount = Number(entity.getProperty("fort:rotation_offset_x"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:rotation_offset_x", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "r" && direction === "y") {
      const oldAmount = Number(entity.getProperty("fort:rotation_offset_y"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:rotation_offset_y", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "r" && direction === "z") {
      const oldAmount = Number(entity.getProperty("fort:rotation_offset_z"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:rotation_offset_z", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "x") {
      const oldAmount = Number(entity.getProperty("fort:transform_offset_x"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:transform_offset_x", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "y") {
      const oldAmount = Number(entity.getProperty("fort:transform_offset_y"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:transform_offset_y", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "z") {
      const oldAmount = Number(entity.getProperty("fort:transform_offset_z"));
      if (oldAmount === null || oldAmount === void 0 || Number.isNaN(oldAmount)) {
        return;
      }
      entity.setProperty("fort:transform_offset_z", oldAmount + amount * mult);
      world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount + amount * mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    }
  } else {
    if (type1 === "r" && direction === "x") {
      entity.setProperty("fort:rotation_offset_x", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "r" && direction === "y") {
      entity.setProperty("fort:rotation_offset_y", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "r" && direction === "z") {
      entity.setProperty("fort:rotation_offset_z", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "x") {
      entity.setProperty("fort:transform_offset_x", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "y") {
      entity.setProperty("fort:transform_offset_y", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "t" && direction === "z") {
      entity.setProperty("fort:transform_offset_z", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
    } else if (type1 === "s" && direction === "c") {
      entity.setProperty("fort:scale_offset", amount);
      world.sendMessage(`set to newAmount: ${amount}, direction: ${type1 + direction}, type: ${type2}, amount: ${amount}`);
    }
  }
}

// ../Regolith/packs/ts-scripts/hitTest.ts
import { GameMode as GameMode2, Player as Player3, system as system3, world as world3 } from "@minecraft/server";

// ../Regolith/packs/ts-scripts/utils/entityLinker.ts
import { world as world2 } from "@minecraft/server";
var EntityLinker = class _EntityLinker {
  /**Maps `entity.id` to arrays of linked entities*/
  static #linkedEntities = /* @__PURE__ */ new Map();
  /**Maps linked entity.id to owner entity */
  static #ownerEntity = /* @__PURE__ */ new Map();
  /**Maps linked entity.id to stasis state */
  static #linkedEntityStasis = /* @__PURE__ */ new Map();
  static #initializeSourceEntity(source) {
    if (!_EntityLinker.#linkedEntities.has(source.id)) {
      _EntityLinker.#linkedEntities.set(source.id, []);
    }
  }
  /**Assumes there's only one entity of a this typeId linked to the source entity */
  static getLinkedEntityUsingTypeId(source, typeId) {
    const linkedEntities = _EntityLinker.getLinkedEntities(source);
    for (const entity of linkedEntities) {
      if (entity.typeId === typeId) {
        return entity;
      }
    }
    return void 0;
  }
  static getLinkedEntities(source) {
    return _EntityLinker.#linkedEntities.get(source.id) ?? [];
  }
  static getOwnerEntity(source) {
    return _EntityLinker.#ownerEntity.get(source.id);
  }
  /**Links the new entity to the source entity:
   * `getOwnerEntity(linkedEntity)` returns source entity
   * `getLinkedEntities(sourceEntity)` includes new entity
   * and adds the new entity to `linkedEntities` map
  */
  static spawnLinkedEntity(source, entityTypeId, relativeLocation, allowSameTypeId) {
    if (!_EntityLinker.#linkedEntities.has(source.id)) {
      _EntityLinker.#initializeSourceEntity(source);
    }
    if (!allowSameTypeId) {
      const linkedEntities = _EntityLinker.getLinkedEntities(source);
      for (const entity of linkedEntities) {
        if (entity.typeId === entityTypeId) {
          console.warn(`Entity of typeId ${entityTypeId} already linked to source entity ${source.id}. Returning existing entity.`);
          return entity;
        }
      }
    }
    const dimension = source.dimension;
    const newEntity = dimension.spawnEntity(entityTypeId, EntityUtils.translateFromHeadLocation(source, relativeLocation));
    _EntityLinker.#addIdToWorldDynamicProperties(newEntity.id, false);
    _EntityLinker.#linkedEntities.get(source.id)?.push(newEntity);
    _EntityLinker.#ownerEntity.set(newEntity.id, source);
    return newEntity;
  }
  static #addIdToWorldDynamicProperties(linkedEntityId, isPersistent) {
    const existing = JSON.parse(String(world2.getDynamicProperty(isPersistent ? C.PERSISTENTDPNAME : C.NONPERSISTENTDPNAME) ?? "[]")) ?? [];
    existing.push(linkedEntityId);
    world2.setDynamicProperty(isPersistent ? C.PERSISTENTDPNAME : C.NONPERSISTENTDPNAME, JSON.stringify(existing));
  }
  static removeAllNonPersistentLinkedEntities() {
    const linkedEntityIds = JSON.parse(String(world2.getDynamicProperty(C.NONPERSISTENTDPNAME) ?? "[]")) ?? [];
    linkedEntityIds.forEach((id) => {
      world2.getEntity(id)?.remove();
      _EntityLinker.#ownerEntity.delete(id);
      _EntityLinker.#linkedEntities.delete(id);
      _EntityLinker.#linkedEntityStasis.delete(id);
    });
    world2.setDynamicProperty(C.NONPERSISTENTDPNAME, JSON.stringify([]));
  }
  static removeLinkedEntityById(ownerId, linkedEntityId) {
    _EntityLinker.#ownerEntity.delete(linkedEntityId);
    _EntityLinker.#linkedEntityStasis.delete(linkedEntityId);
    const linkedEntities = _EntityLinker.#linkedEntities.get(ownerId);
    if (linkedEntities === void 0) return;
    const index = linkedEntities.findIndex((e) => e.id === linkedEntityId);
    if (index === -1) return;
    linkedEntities.splice(index, 1);
  }
  static setLinkedEntityStasis(linkedEntity, isInStasis) {
    _EntityLinker.#linkedEntityStasis.set(linkedEntity.id, isInStasis);
  }
  static getLinkedEntityStasis(linkedEntity) {
    return _EntityLinker.#linkedEntityStasis.get(linkedEntity.id) ?? false;
  }
  static printLinkedEntities() {
    let output = "All Linked Entities:\n";
    _EntityLinker.#linkedEntities.forEach((linkedEntities, sourceId) => {
      output += `Source Entity TypeId: ${world2.getEntity(sourceId)?.typeId}
`;
      linkedEntities.forEach((entity) => {
        output += `  Linked Entity ID: ${entity.id}, Type ID: ${entity.typeId}, Position: ${entity.location.x}, ${entity.location.y}, ${entity.location.z}
`;
      });
    });
    console.log(output);
  }
  static printOwnerEntities() {
    let output = "All Owner Entities:\n";
    _EntityLinker.#ownerEntity.forEach((ownerEntity, linkedEntityId) => {
      output += `Linked Entity ID: ${linkedEntityId}, Owner Entity ID: ${ownerEntity.id}
`;
    });
    console.log(output);
  }
};

// ../Regolith/packs/ts-scripts/hitTest.ts
var HitType = /* @__PURE__ */ ((HitType2) => {
  HitType2[HitType2["Block"] = 0] = "Block";
  HitType2[HitType2["Entity"] = 1] = "Entity";
  HitType2[HitType2["HitDetectEntity"] = 2] = "HitDetectEntity";
  return HitType2;
})(HitType || {});
world3.afterEvents.entityHitBlock.subscribe((eventData) => {
  const entity = eventData.damagingEntity;
  if (!(entity instanceof Player3)) return;
  if (!EntityUtils.getMainhandItemStack(entity)?.typeId.includes(C.NAMESPACE)) return;
  onHit(entity, 0 /* Block */);
});
world3.afterEvents.entityHitEntity.subscribe((eventData) => {
  const entity = eventData.damagingEntity;
  const hitEntity = eventData.hitEntity;
  if (!(entity instanceof Player3)) return;
  if (!EntityUtils.getMainhandItemStack(entity)?.typeId.includes(C.NAMESPACE)) return;
  if (hitEntity.typeId === C.HITDETECTENTITYNAME) {
    onHit(entity, 2 /* HitDetectEntity */);
  } else {
    onHit(entity, 1 /* Entity */);
  }
});
Interval.addInterval(new Interval.MainInterval(C.HITTESTINTERVALNAME, () => {
  world3.getAllPlayers().forEach((player) => {
    let shouldSpawnHitDetectEntity = true;
    const BlockRaycastHit = player.getBlockFromViewDirection({ maxDistance: C.BLOCKPLACERANGE + 2 });
    if (BlockRaycastHit !== void 0) {
      const hitBlock = BlockRaycastHit.block;
      const hitPos = Vector3Utils.add({ x: hitBlock.x, y: hitBlock.y, z: hitBlock.z }, BlockRaycastHit.faceLocation);
      const distance = Vector3Utils.magnitude(Vector3Utils.subtract(hitPos, player.getHeadLocation()));
      if (distance <= C.BLOCKPLACERANGE) {
        shouldSpawnHitDetectEntity = false;
      }
    }
    const gamemode = player.getGameMode();
    const entityRaycastRange = gamemode === GameMode2.creative ? C.CREATIVEHITRANGE : C.SURVIVALHITRANGE;
    if (EntityUtils.getValidEntitiesNearby(player, entityRaycastRange).length > 0) {
      const entityRaycastHit = EntityUtils.getValidEntitiesFromRayCast(player, player.getHeadLocation(), player.getViewDirection(), entityRaycastRange);
      if (entityRaycastHit.length > 0) {
        shouldSpawnHitDetectEntity = false;
      }
    }
    if (shouldSpawnHitDetectEntity) {
      if (EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME) === void 0) {
        const hitDetectEntity2 = EntityLinker.spawnLinkedEntity(player, C.HITDETECTENTITYNAME, { x: 0, y: 0, z: 2 }, true);
        initializeHitDetectEntity(hitDetectEntity2);
      }
      const hitDetectEntity = EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME);
      if (hitDetectEntity !== void 0) {
        EntityLinker.setLinkedEntityStasis(hitDetectEntity, false);
      }
    } else if (!shouldSpawnHitDetectEntity) {
      const hitDetectEntity = EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME);
      if (hitDetectEntity !== void 0) {
        EntityLinker.setLinkedEntityStasis(hitDetectEntity, true);
      }
    }
  });
}, 1));
function onHit(source, hitType) {
  world3.sendMessage(`Hit detected, type: ${HitType[hitType]}`);
  world3.playSound("item.trident.throw", source.location, { volume: 1 });
}
function initializeHitDetectEntity(entity) {
  const owner = EntityLinker.getOwnerEntity(entity);
  if (owner === void 0) return;
  const intervalId = system3.runInterval(() => {
    if (!EntityUtils.isAlive(entity)) {
      system3.clearRun(intervalId);
      return;
    }
    if (!EntityUtils.isAlive(owner)) {
      system3.clearRun(intervalId);
      return;
    }
    if (!EntityLinker.getLinkedEntityStasis(entity)) {
      const veloH = { x: owner.getVelocity().x, y: 0, z: owner.getVelocity().z };
      const ownerSpeedH = Vector3Utils.magnitude(veloH);
      var tpDistanceH = CustomMathUtils.clamp(ownerSpeedH * 6, 0, 2.4);
      var tpDistanceV = CustomMathUtils.clamp(owner.getVelocity().y * 2, -2.4, 2.4);
      const newLocation = EntityUtils.translateFromHeadLocation(owner, { x: 0, y: tpDistanceV, z: tpDistanceH }, true);
      entity.teleport(newLocation, { dimension: owner.dimension });
    } else {
      entity.teleport({ x: owner.location.x, y: owner.location.y + 4, z: owner.location.z }, { dimension: owner.dimension });
    }
  });
}
world3.afterEvents.entityDie.subscribe((eventData) => {
  const entity = eventData.deadEntity;
  if (entity.typeId !== C.HITDETECTENTITYNAME) return;
  renewHitDetectEntityOnAccidentalKill(entity);
});
function renewHitDetectEntityOnAccidentalKill(entity) {
  const owner = EntityLinker.getOwnerEntity(entity);
  if (owner === void 0) return;
  const ownerId = owner.id;
  const linkedEntityId = entity.id;
  try {
    entity.remove();
  } catch {
  }
  EntityLinker.removeLinkedEntityById(ownerId, linkedEntityId);
  const hitDetectEntity = EntityLinker.spawnLinkedEntity(owner, C.HITDETECTENTITYNAME, { x: 0, y: 0, z: 2 }, true);
  initializeHitDetectEntity(hitDetectEntity);
  world3.sendMessage("Renewing hit detect entity on reload");
}

// ../Regolith/packs/ts-scripts/main.ts
var slash = new Slash(3, 120, 30, { x: 0, y: 0, z: 2 });
EntityLinker.removeAllNonPersistentLinkedEntities();
Interval.start();

//# sourceMappingURL=../debug/main.js.map
