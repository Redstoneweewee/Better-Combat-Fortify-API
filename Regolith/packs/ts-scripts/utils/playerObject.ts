import { Player } from "@minecraft/server";


export class PlayerObject {
    player: Player;
    

    constructor(player: Player) {
        this.player = player;
    }
}