import { Entity, Vector3, world } from "@minecraft/server";
import { EntityUtils } from "./utils";
import { C } from "../constants";

export interface ArcRotationParams {
  rotAxis: Vector3;
  angleDeg: number;
}

export class EntityLinker {

  /**Maps `entity.id` to arrays of linked entities*/
  static #linkedEntities: Map<string, Entity[]> = new Map();
  /**Maps linked entity.id to owner entity */
  static #ownerEntity: Map<string, Entity> = new Map();
  /**Maps linked entity.id to stasis state */
  static #linkedEntityStasis: Map<string, boolean> = new Map();

  static #initializeSourceEntity(source: Entity) {
    if (!EntityLinker.#linkedEntities.has(source.id)) {
      EntityLinker.#linkedEntities.set(source.id, []);
    }
  }

  /**Assumes there's only one entity of a this typeId linked to the source entity */
  static getLinkedEntityUsingTypeId(source: Entity, typeId: string): Entity | undefined {
    const linkedEntities = EntityLinker.getLinkedEntities(source);
    for (const entity of linkedEntities) {
      if (entity.typeId === typeId) {
        return entity;
      }
    }
    return undefined;
  }
  static getLinkedEntities(source: Entity): Entity[] {
    return EntityLinker.#linkedEntities.get(source.id) ?? [];
  }
  static getOwnerEntity(source: Entity): Entity | undefined {
    return EntityLinker.#ownerEntity.get(source.id);
  }

  /**Links the new entity to the source entity:
   * `getOwnerEntity(linkedEntity)` returns source entity
   * `getLinkedEntities(sourceEntity)` includes new entity
   * and adds the new entity to `linkedEntities` map
  */
  static spawnLinkedEntity(source: Entity, entityTypeId: string, relativeLocation: Vector3, allowSameTypeId: boolean): Entity {
    if (!EntityLinker.#linkedEntities.has(source.id)) {
      EntityLinker.#initializeSourceEntity(source);
    }
    if(!allowSameTypeId) {
      const linkedEntities = EntityLinker.getLinkedEntities(source);
      for (const entity of linkedEntities) {
        if (entity.typeId === entityTypeId) {
          console.warn(`Entity of typeId ${entityTypeId} already linked to source entity ${source.id}. Returning existing entity.`);
          return entity;
        }
      }
    }
    
    const dimension = source.dimension;
    const newEntity = dimension.spawnEntity(entityTypeId, EntityUtils.translateFromHeadLocation(source, relativeLocation));
    EntityLinker.#addIdToWorldDynamicProperties(newEntity.id, false);
    EntityLinker.#linkedEntities.get(source.id)?.push(newEntity);
    EntityLinker.#ownerEntity.set(newEntity.id, source);
    return newEntity;
  }

  static #addIdToWorldDynamicProperties(linkedEntityId: string, isPersistent: boolean) {
    const existing: string[] = JSON.parse(String(world.getDynamicProperty(isPersistent ? C.PERSISTENTDPNAME : C.NONPERSISTENTDPNAME)??"[]")) ?? [];
    existing.push(linkedEntityId);
    world.setDynamicProperty(isPersistent ? C.PERSISTENTDPNAME : C.NONPERSISTENTDPNAME, JSON.stringify(existing));
  }

  static removeAllNonPersistentLinkedEntities() {
    const linkedEntityIds: string[] = JSON.parse(String(world.getDynamicProperty(C.NONPERSISTENTDPNAME)??"[]")) ?? [];
    linkedEntityIds.forEach(id => {
      world.getEntity(id)?.remove();
      EntityLinker.#ownerEntity.delete(id);
      EntityLinker.#linkedEntities.delete(id);
      EntityLinker.#linkedEntityStasis.delete(id);
    });
    world.setDynamicProperty(C.NONPERSISTENTDPNAME, JSON.stringify([]));
  }

  static removeLinkedEntityById(ownerId: string, linkedEntityId: string) {
    EntityLinker.#ownerEntity.delete(linkedEntityId);
    EntityLinker.#linkedEntityStasis.delete(linkedEntityId);
    const linkedEntities = EntityLinker.#linkedEntities.get(ownerId);
    if(linkedEntities === undefined) return;
    const index = linkedEntities.findIndex(e => e.id === linkedEntityId);
    if(index === -1) return;
    linkedEntities.splice(index, 1);
  }
  static setLinkedEntityStasis(linkedEntity: Entity, isInStasis: boolean) {
    EntityLinker.#linkedEntityStasis.set(linkedEntity.id, isInStasis);
  }

  static getLinkedEntityStasis(linkedEntity: Entity): boolean {
    return EntityLinker.#linkedEntityStasis.get(linkedEntity.id) ?? false;
  }

  static printLinkedEntities() {
    let output: string = "All Linked Entities:\n";
    EntityLinker.#linkedEntities.forEach((linkedEntities, sourceId) => {
      output += `Source Entity TypeId: ${world.getEntity(sourceId)?.typeId}\n`;
      linkedEntities.forEach(entity => {
        output += `  Linked Entity ID: ${entity.id}, Type ID: ${entity.typeId}, Position: ${entity.location.x}, ${entity.location.y}, ${entity.location.z}\n`;
      });
    });
    console.log(output);
  }

  static printOwnerEntities() {
    let output: string = "All Owner Entities:\n";
    EntityLinker.#ownerEntity.forEach((ownerEntity, linkedEntityId) => {
      output += `Linked Entity ID: ${linkedEntityId}, Owner Entity ID: ${ownerEntity.id}\n`;
    });
    console.log(output);
  }
  
}
