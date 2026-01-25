import { Entity, GameMode, Player, system, world } from "@minecraft/server";
import { CustomVectorUtils, EntityUtils } from "./utils/utils";
import { C } from "./constants";
import { Interval } from "./utils/interval";
import { Vector3Builder, Vector3Utils } from "./utils/minecraft-math";

enum HitType {
    Block,
    Entity,
    HitDetectEntity
}


world.afterEvents.entityHitBlock.subscribe(eventData => {
    const entity = eventData.damagingEntity;
    //const block = eventData.hitBlock;
    if(!(entity instanceof Player)) return;
    if(!EntityUtils.getMainhandItemStack(entity)?.typeId.includes("fort:")) return;
    onHit(HitType.Block);
});

world.afterEvents.entityHitEntity.subscribe(eventData => {
    const entity = eventData.damagingEntity;
    const hitEntity = eventData.hitEntity;
    if(!(entity instanceof Player)) return;
    if(!EntityUtils.getMainhandItemStack(entity)?.typeId.includes("fort:")) return;
    if(hitEntity.typeId === C.HITDETECTENTITYNAME) {
        onHit(HitType.HitDetectEntity);
    }
    else {
        onHit(HitType.Entity);
    }
});


Interval.addInterval(new Interval.MainInterval("interval1", () => {
    world.getAllPlayers().forEach(player => {
        let shouldSpawnHitDetectEntity = true;

        const BlockRaycastHit = player.getBlockFromViewDirection({maxDistance: C.BLOCKPLACERANGE+2});
        if(BlockRaycastHit !== undefined) {
            const hitBlock = BlockRaycastHit.block;
            const hitPos = Vector3Utils.add({x: hitBlock.x, y: hitBlock.y, z: hitBlock.z}, BlockRaycastHit.faceLocation);
            const distance = Vector3Utils.magnitude(Vector3Utils.subtract(hitPos, player.getHeadLocation()));
            if(distance <= C.BLOCKPLACERANGE) {
                shouldSpawnHitDetectEntity = false;
            }
            //world.sendMessage(`Block hit at distance: ${distance}`);
        }
        const gamemode = player.getGameMode();
        const entityRaycastRange = gamemode === GameMode.creative ? C.CREATIVEHITRANGE : C.SURVIVALHITRANGE;
        //world.sendMessage(`Gamemode: ${gamemode}, Enum: ${GameMode.creative} Entity raycast range: ${entityRaycastRange}`);
        if(EntityUtils.getNearbyEntities(player, entityRaycastRange).length > 0) {
            const entityRaycastHit = EntityUtils.getValidEntitiesFromRayCast(player, player.getHeadLocation(), player.getViewDirection(), entityRaycastRange);
            if(entityRaycastHit.length > 0) {
                shouldSpawnHitDetectEntity = false;
            }
        }

        if(shouldSpawnHitDetectEntity) {
            world.sendMessage("Spawning hit detect entity");
        }
    });
}, 20));

function onHit(hitType: HitType) {
    world.sendMessage(`Hit detected, type: ${HitType[hitType]}`);
}

// function cont(entity: Entity) {
//     //const owning_identifier = getScore(entity, "owning_identifier")??0;
//     const owner = entity; //stud
//     //const owner = entity.dimension.getEntities({scoreOptions:[{objective: "identifier", maxScore: owning_identifier, minScore: owning_identifier}]})[0];
//     if(owner === undefined) return;
//     system.runInterval(() => {
//         if(!entity.isValid) { return; }
//         if(!owner.isValid) { entity.remove(); return; }
        
//         const velo = owner.getVelocity();
//         const ownerSpeed = Math.sqrt(velo.x**2 + velo.y**2 + velo.z**2);
//         var tpDistance = 0;
//         if(ownerSpeed > 0.3) { tpDistance = 2.4; }
//         else { tpDistance = ownerSpeed*6; }
//         const newLocation = EntityUtils.translateFromHeadLocation(owner, {x: 0, y: 0, z: tpDistance}, true);
//         entity.teleport(newLocation, {dimension: owner.dimension});
//     });
// }
