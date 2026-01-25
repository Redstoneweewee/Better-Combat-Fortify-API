import { Entity, Player, system, world } from "@minecraft/server";
import { EntityUtils } from "./utils/utils";
import { Consts } from "./constants";

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
    if(hitEntity.typeId === Consts.HITDETECTENTITYNAME) {
        onHit(HitType.HitDetectEntity);
    }
    else {
        onHit(HitType.Entity);
    }
});



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