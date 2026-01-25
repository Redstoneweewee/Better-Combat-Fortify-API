import { world, system, Vector3 } from "@minecraft/server";
import { Vector3Utils } from "./utils/minecraft-math";
import { DrawEffects } from "./utils/utils";
import { Slash } from "./attacks/slash";
import "./scriptEvents"

function mainTick() {
  if (system.currentTick % 50 === 0) {

    const players = world.getPlayers();
    if (players.length > 0) {
      const player = players[0];
      const viewVector = player.getViewDirection();
      const center = player.getHeadLocation();

      const slash = new Slash(3, 120, 30, {x: 0, y: 0, z: 2});
      //slash.drawSlashEffect(player.dimension, center, viewVector);

    }
    //players[0].startItemCooldown("fort:test", -1);
  }

  system.run(mainTick);
}

system.run(mainTick);





function isHitBySlash(
  playerPos: Vector3,
  playerForward: Vector3, // must be normalized
  targetPos: Vector3,
  radius: number,
  horizontalAngleDeg: number,
  verticalAngleDeg: number,
  ): boolean {
  // Vector from player to target
  const D = Vector3Utils.subtract(targetPos, playerPos);
  const dist = Vector3Utils.magnitude(D);
  if (dist > radius) return false;

  const Dn = Vector3Utils.normalize(D);
  // --- Horizontal (XZ plane) check ---
  const Fh = Vector3Utils.normalize({ x: playerForward.x, y: 0, z: playerForward.z });
  const Dh = Vector3Utils.normalize({ x: Dn.x, y: 0, z: Dn.z });

  // Edge case: player looking straight up/down
  if (Vector3Utils.magnitude(Fh) === 0 || Vector3Utils.magnitude(Dh) === 0) return false;

  const halfH = (horizontalAngleDeg * Math.PI) / 360;
  if (Vector3Utils.dot(Fh, Dh) < Math.cos(halfH)) return false;

  // --- Vertical (pitch) check ---
  const Fy = Vector3Utils.normalize({
    x: Math.sqrt(playerForward.x ** 2 + playerForward.z ** 2),
    y: playerForward.y,
    z: 0,
  });

  const Dy = Vector3Utils.normalize({
    x: Math.sqrt(Dn.x ** 2 + Dn.z ** 2),
    y: Dn.y,
    z: 0,
  });

  const halfV = (verticalAngleDeg * Math.PI) / 360;
  if (Vector3Utils.dot(Fy, Dy) < Math.cos(halfV)) return false;

  return true;
}
