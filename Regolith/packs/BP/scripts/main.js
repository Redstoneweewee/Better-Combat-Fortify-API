// ../Regolith/packs/ts-scripts/main.ts
import { world, system } from "@minecraft/server";

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

// ../Regolith/packs/ts-scripts/constants.ts
var Consts = class {
  static DEBUGPARTICLENAME = "minecraft:basic_flame_particle";
};

// ../Regolith/packs/ts-scripts/utils/utils.ts
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
};
var DrawEffects = class {
  static drawRay(dimension, startPos, direction, length, pointsNum) {
    for (let i = 0; i < pointsNum; i++) {
      const t = i / pointsNum;
      dimension.spawnParticle(
        Consts.DEBUGPARTICLENAME,
        {
          x: startPos.x + direction.x * t * length,
          y: startPos.y + direction.y * t * length,
          z: startPos.z + direction.z * t * length
        }
      );
    }
  }
  static drawArc(dimension, startPos, direction, distance, arcRotation, pointsNum) {
    for (let i = 0; i <= pointsNum; i++) {
      const a = -arcRotation[0].angleDeg + i / pointsNum * (2 * arcRotation[0].angleDeg);
      let dir = CustomVectorUtils.rotateAroundAxis(direction, arcRotation[0].rotAxis, a);
      let r = 1;
      while (arcRotation.length > r) {
        dir = CustomVectorUtils.rotateAroundAxis(dir, arcRotation[r].rotAxis, arcRotation[r].angleDeg);
        r++;
      }
      dimension.spawnParticle(
        Consts.DEBUGPARTICLENAME,
        {
          x: startPos.x + dir.x * distance,
          y: startPos.y + dir.y * distance,
          z: startPos.z + dir.z * distance
        }
      );
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

// ../Regolith/packs/ts-scripts/main.ts
function mainTick() {
  if (system.currentTick % 50 === 0) {
    const players = world.getPlayers();
    if (players.length > 0) {
      const player = players[0];
      const viewVector = player.getViewDirection();
      const center = player.getHeadLocation();
      const slash = new Slash(3, 120, 30, { x: 0, y: 0, z: 2 });
      slash.drawSlashEffect(player.dimension, center, viewVector);
    }
  }
  system.run(mainTick);
}
system.run(mainTick);

//# sourceMappingURL=../debug/main.js.map
