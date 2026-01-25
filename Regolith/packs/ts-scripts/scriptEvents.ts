import { Entity, Player, system, world } from "@minecraft/server";


system.afterEvents.scriptEventReceive.subscribe(eventData => {
    const id = eventData.id;
    const message = eventData.message;

    /**
     * Example Usage:
     * /scriptevent fort:transform_offset rx+10    // rotate x by +10 degrees
     * /scriptevent fort:transform_offset ty-15    // transform y by -15 units
     * /scriptevent fort:transform_offset sc-15    // scale by -15 units
     * /scriptevent fort:transform_offset tys5     // set transform y to 5 units
     * /scriptevent fort:transform_offset read     // read all offsets and print to chat
     * /scriptevent fort:transform_offset mul10     // set scale to 10 units
     * /scriptevent fort:transform_offset toggle    // toggle whether offsets apply to players or armor stands
     */

    if(id === "fort:transform_offset") {
        const lowerCase = message.toLowerCase();
        const type1 = lowerCase[0];
        const direction = lowerCase[1];
        const type2 = lowerCase[2];
        let amount = Number(lowerCase.match(/\d+/)??[][0]);
        if(type2 === "-") {
            amount = -1*amount;
        }

        if(lowerCase === "toggle") {
            const value = !Boolean(world.getDynamicProperty("fort:transform_offset_apply_to_players"));
            world.setDynamicProperty("fort:transform_offset_apply_to_players", value);
            if(!value) {
                world.sendMessage("Transform Offsets Apply to armor stands");
            }
            else {
                world.sendMessage("Transform Offsets Apply to players only");
            }
            return;
        }
        else if(lowerCase.includes("mul")) {         
            world.setDynamicProperty("fort:transform_offset_multiply", amount > 0 ? amount : 1);
            world.sendMessage(`Set Transform Offset Multiply to ${amount > 0 ? amount : 1}`);
            return;
        }

        if(world.getDynamicProperty("fort:transform_offset_apply_to_players")) {
            world.getAllPlayers().forEach(player => {
                offset(player, lowerCase, type1, direction, type2, amount);
            });
        }
        else {
            world.getAllPlayers().forEach(player => {
                const entities = player?.dimension.getEntities({
                    type: "minecraft:armor_stand",
                    location: player?.location,
                    maxDistance: 15
                });
                
                entities.forEach(entity => {
                    offset(entity, lowerCase, type1, direction, type2, amount);
                });
            });
        }
    }
});


function offset(entity: Entity, lowerCase: string, type1: string, direction: string, type2: string, amount: number) {
    const mult = Number(world.getDynamicProperty("fort:transform_offset_multiply")) ?? 1;
    
    if(lowerCase === "read") {
        const offsets = {
            rx: 0,
            ry: 0,
            rz: 0,
            tx: 0,
            ty: 0,
            tz: 0,
            sc: 0
        }
        offsets.rx = Number(entity.getProperty("fort:rotation_offset_x"));
        offsets.ry = Number(entity.getProperty("fort:rotation_offset_y"));
        offsets.rz = Number(entity.getProperty("fort:rotation_offset_z"));
        offsets.tx = Number(entity.getProperty("fort:transform_offset_x"));
        offsets.ty = Number(entity.getProperty("fort:transform_offset_y"));
        offsets.tz = Number(entity.getProperty("fort:transform_offset_z"));
        offsets.sc = Number(entity.getProperty("fort:scale_offset"));
        const message = `rotation offset x:  ${offsets.rx}\n`+
                        `rotation offset y:  ${offsets.ry}\n`+
                        `rotation offset z:  ${offsets.rz}\n`+
                        `transform offset x: ${offsets.tx}\n`+
                        `transform offset y: ${offsets.ty}\n`+
                        `transform offset z: ${offsets.tz}\n`+
                        `scale offset:       ${offsets.sc}`;
        world.sendMessage(message);
    }
    if(type1 === "s" && direction === "c") {
        const oldAmount = Number(entity.getProperty("fort:scale_offset"));
        if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
        entity.setProperty("fort:scale_offset", oldAmount+amount*mult);
        world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${type1+direction}, type: ${type2}, amount: ${amount}`);
    }
    else if(type2 !== "s") {
        if(type1 === "r" && direction === "x") {
            const oldAmount = Number(entity.getProperty("fort:rotation_offset_x"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:rotation_offset_x", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "r" && direction === "y") {
            const oldAmount = Number(entity.getProperty("fort:rotation_offset_y"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:rotation_offset_y", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "r" && direction === "z") {
            const oldAmount = Number(entity.getProperty("fort:rotation_offset_z"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:rotation_offset_z", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }

        else if(type1 === "t" && direction === "x") {
            const oldAmount = Number(entity.getProperty("fort:transform_offset_x"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:transform_offset_x", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "t" && direction === "y") {
            const oldAmount = Number(entity.getProperty("fort:transform_offset_y"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:transform_offset_y", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "t" && direction === "z") {
            const oldAmount = Number(entity.getProperty("fort:transform_offset_z"));
            if(oldAmount === null || oldAmount === undefined || Number.isNaN(oldAmount)) { return; }
            entity.setProperty("fort:transform_offset_z", oldAmount+amount*mult);
            world.sendMessage(`oldAmount: ${oldAmount}, newAmount: ${oldAmount+amount*mult}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
    }
    else {
        if(type1 === "r" && direction === "x") {
            entity.setProperty("fort:rotation_offset_x", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "r" && direction === "y") {
            entity.setProperty("fort:rotation_offset_y", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "r" && direction === "z") {
            entity.setProperty("fort:rotation_offset_z", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }

        else if(type1 === "t" && direction === "x") {
            entity.setProperty("fort:transform_offset_x", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "t" && direction === "y") {
            entity.setProperty("fort:transform_offset_y", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "t" && direction === "z") {
            entity.setProperty("fort:transform_offset_z", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${direction}, type: ${type2}, amount: ${amount}`);
        }
        else if(type1 === "s" && direction === "c") {
            entity.setProperty("fort:scale_offset", amount);
            world.sendMessage(`set to newAmount: ${amount}, direction: ${type1+direction}, type: ${type2}, amount: ${amount}`);
        }
    }
}