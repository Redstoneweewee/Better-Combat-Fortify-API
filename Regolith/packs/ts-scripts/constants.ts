import { GameMode } from "@minecraft/server";

export class C {
    static readonly DEBUGPARTICLENAME = "minecraft:basic_flame_particle";
    static readonly HITDETECTENTITYNAME = "fort:hit_detect_entity";
    static readonly HITEXCLUDEDFAMILIES = ["minecraft:inanimate", "minecraft:projectile"];
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
    static readonly BLOCKPLACERANGE = 5.2;
    static readonly CREATIVEHITRANGE = 6;
    static readonly SURVIVALHITRANGE = 3.3;
}