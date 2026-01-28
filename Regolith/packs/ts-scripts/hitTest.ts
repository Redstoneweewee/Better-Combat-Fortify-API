import { Entity, EntityComponent, EntityComponentTypes, EntityHealthComponent, GameMode, Player, system, world } from "@minecraft/server";
import { CustomMathUtils, CustomVectorUtils, EntityUtils } from "./utils/utils";
import { C } from "./constants";
import { Interval } from "./utils/interval";
import { Vector3Builder, Vector3Utils } from "./utils/minecraft-math";
import { EntityLinker } from "./utils/entityLinker";
import { WeaponRegistry } from "./weapons/weaponRegistry";

enum HitType {
    Block,
    Entity,
    HitDetectEntity
}


world.afterEvents.entityHitBlock.subscribe(eventData => {
    const entity = eventData.damagingEntity;
    //const block = eventData.hitBlock;
    if(!(entity instanceof Player)) return;
    if(!WeaponRegistry.isWeapon(EntityUtils.getMainhandItemStack(entity))) return;
    onHit(entity, HitType.Block);
});

/**Tests for non-players as well */
world.afterEvents.entityHitEntity.subscribe(eventData => {
    const entity = eventData.damagingEntity;
    const hitEntity = eventData.hitEntity;
    if(!WeaponRegistry.isWeapon(EntityUtils.getMainhandItemStack(entity))) return;
    if(hitEntity.typeId === C.HITDETECTENTITYNAME) {
        onHit(entity, HitType.HitDetectEntity);
    }
    else {
        onHit(entity, HitType.Entity);
    }
});


Interval.addInterval(new Interval.MainInterval(C.HITTESTINTERVALNAME, () => {
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
            //world.sendMessage(EntityUtils.getValidEntitiesNearby(player, entityRaycastRange).length.toString());
        if(EntityUtils.getValidEntitiesNearby(player, entityRaycastRange).length > 0) {
            const entityRaycastHit = EntityUtils.getValidEntitiesFromRayCast(player, player.getHeadLocation(), player.getViewDirection(), entityRaycastRange);
            if(entityRaycastHit.length > 0) {
                shouldSpawnHitDetectEntity = false;
            }
        }

        if(shouldSpawnHitDetectEntity) {
            if(EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME) === undefined) {
                //world.sendMessage("Spawning hit detect entity");
                const hitDetectEntity = EntityLinker.spawnLinkedEntity(player, C.HITDETECTENTITYNAME, {x: 0, y: 0, z: 2}, true);
                initializeHitDetectEntity(hitDetectEntity);
            }
            const hitDetectEntity = EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME);
            if(hitDetectEntity !== undefined) {
                //world.sendMessage("hit detect entity exists, no spawn needed");
                EntityLinker.setLinkedEntityStasis(hitDetectEntity, false);
            }
        }
        else if(!shouldSpawnHitDetectEntity) {
            //world.sendMessage("setting hit detect entity to stasis");
            const hitDetectEntity = EntityLinker.getLinkedEntityUsingTypeId(player, C.HITDETECTENTITYNAME);
            if(hitDetectEntity !== undefined) {
                EntityLinker.setLinkedEntityStasis(hitDetectEntity, true);
            }
        }        
    });
}, 1));



function initializeHitDetectEntity(entity: Entity) {
    const owner = EntityLinker.getOwnerEntity(entity);
    if(owner === undefined) return;
    const intervalId = system.runInterval(() => {
        if(!EntityUtils.isAlive(entity)) { system.clearRun(intervalId); return; }
        if(!EntityUtils.isAlive(owner)) { system.clearRun(intervalId); return; }
        
        if(!EntityLinker.getLinkedEntityStasis(entity)) {
            const veloH = {x: owner.getVelocity().x, y: 0, z: owner.getVelocity().z};
            const ownerSpeedH = Vector3Utils.magnitude(veloH);
            var tpDistanceH = CustomMathUtils.clamp(ownerSpeedH*6, 0, 2.4);
            var tpDistanceV = CustomMathUtils.clamp(owner.getVelocity().y*2, -2.4, 2.4);
            const newLocation = EntityUtils.translateFromHeadLocation(owner, {x: 0, y: tpDistanceV, z: tpDistanceH}, true);

            entity.teleport(newLocation, {dimension: owner.dimension});
        }
        else {
            entity.teleport({x:owner.location.x, y:owner.location.y+4, z:owner.location.z}, {dimension: owner.dimension});
        }
    });
}


world.afterEvents.entityDie.subscribe(eventData => {
    const entity = eventData.deadEntity;
    if(entity.typeId !== C.HITDETECTENTITYNAME) return;
    renewHitDetectEntityOnAccidentalKill(entity);
});

function renewHitDetectEntityOnAccidentalKill(entity: Entity) {
    const owner = EntityLinker.getOwnerEntity(entity);
    if(owner === undefined) return;
    const ownerId = owner.id;
    const linkedEntityId = entity.id;
    //system.runTimeout(() => {
        try {entity.remove();} catch {}
        EntityLinker.removeLinkedEntityById(ownerId, linkedEntityId);
        const hitDetectEntity = EntityLinker.spawnLinkedEntity(owner, C.HITDETECTENTITYNAME, {x: 0, y: 0, z: 2}, true);
        initializeHitDetectEntity(hitDetectEntity);
    //});
    world.sendMessage("Renewing hit detect entity on reload");
}



function onHit(entity: Entity, hitType: HitType) {
    //world.sendMessage(`Hit detected, type: ${HitType[hitType]}`);
    const mainhandItemStack = EntityUtils.getMainhandItemStack(entity);
    if(mainhandItemStack === undefined) return;
    if(!WeaponRegistry.isWeapon(mainhandItemStack)) return;
    const weaponObj = WeaponRegistry.getWeapon(mainhandItemStack.typeId);
    if(!weaponObj) return;

    const result = weaponObj.tryExecuteAttack(entity, true);
    if(result.executed) {
        world.playSound("item.trident.throw", entity.getHeadLocation(), {volume: 1});
    }
    if(!result.hit && result.cooldownTime !== undefined) {
        world.sendMessage(`Weapon on cooldown, time left: ${result.cooldownTime} ticks`);
    }
    else {
        world.sendMessage(`Attack missed!`);
    }
}

