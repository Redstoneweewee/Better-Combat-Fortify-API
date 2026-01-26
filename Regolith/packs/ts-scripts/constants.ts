import { GameMode } from "@minecraft/server";

export class C {
    static readonly NAMESPACE = "fort:";

    /**World Dynamic Property IDs for linked entities */
    static readonly NONPERSISTENTDPNAME = "nonpersistent_linked_entities";  //non-persistent linked entities world dynamic property name
    static readonly PERSISTENTDPNAME = "persistent_linked_entities";  //persistent linked entities world dynamic property name
    
    /**Interval Names */
    static readonly HITTESTINTERVALNAME = "hitTestInterval";

    /**Particles */
    static readonly DEBUGPARTICLENAME = "minecraft:basic_flame_particle";

    /**Entities */
    static readonly HITDETECTENTITYNAME = "fort:hit_detect_entity";


    /**Hit Test */
    static readonly HITEXCLUDEDFAMILIES = ["minecraft:inanimate", "minecraft:projectile", "inanimate"];
    static readonly HITEXCLUDEDGAMEMODES = [GameMode.creative, GameMode.spectator];
    static readonly HITEXCLUDEDTYPES = [
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
    static readonly BLOCKPLACERANGE = 5.2;
    static readonly CREATIVEHITRANGE = 6;
    static readonly SURVIVALHITRANGE = 3.3;

}