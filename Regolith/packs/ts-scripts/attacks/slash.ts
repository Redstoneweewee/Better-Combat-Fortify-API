import { Dimension, DimensionType, DimensionTypes, EntityDamageCause, Vector3, world } from "@minecraft/server";
import { CustomVectorUtils, DrawEffects } from "../utils/utils";
import { Vector3Utils } from "../utils/minecraft-math";
import { Interval } from "../utils/interval";
import { IAttack } from "./attack";


export class Slash implements IAttack {
    minRange: number;
    maxRange: number;
    cooldown: number;
    totalHorizontalAngleDeg: number;
    totalVerticalAngleDeg: number;
    /** Offset from the attack position `{x: left-right, y: up-down, z: forward-backward}`*/
    attackOffset: Vector3;
    attackType: EntityDamageCause;
    

    constructor(maxRange: number, minRange: number, cooldown: number, totalHorizontalAngleDeg: number, totalVerticalAngleDeg: number, attackOffset?: Vector3, attackType?: EntityDamageCause) {
        this.maxRange = maxRange;
        this.minRange = minRange;
        this.cooldown = cooldown;
        this.totalHorizontalAngleDeg = totalHorizontalAngleDeg;
        this.totalVerticalAngleDeg = totalVerticalAngleDeg;
        this.attackOffset = attackOffset ? attackOffset : {x: 0, y: 0, z: 0};
        this.attackType = attackType ? attackType : EntityDamageCause.entityAttack;
    }

    isHit(playerPos: Vector3, playerForward: Vector3, targetPos: Vector3): boolean {
        const basis = CustomVectorUtils.createBasisFromForward(playerForward);

        // Apply attack offset in local space
        const origin = CustomVectorUtils.translateRelativeToBasis(
            playerPos,
            basis,
            this.attackOffset
        );

        const D = Vector3Utils.subtract(targetPos, origin);
        const dist = Vector3Utils.magnitude(D);
        // Check radial distance
        if (dist > this.maxRange || dist < this.minRange) return false;

        const halfH = (this.totalHorizontalAngleDeg * Math.PI) / 360;
        const halfV = (this.totalVerticalAngleDeg * Math.PI) / 360;
        const DNorm = Vector3Utils.normalize(D);

        const horizontalDot = Vector3Utils.dot(DNorm, basis.right);
        const verticalDot = Vector3Utils.dot(DNorm, basis.up);
        const forwardDot = Vector3Utils.dot(DNorm, basis.forward);
        const horizontalAngle = Math.atan2(horizontalDot, forwardDot);
        const verticalAngle = Math.atan2(verticalDot, Math.sqrt(forwardDot * forwardDot + horizontalDot * horizontalDot));

        world.sendMessage(`Horizontal Angle: ${(horizontalAngle * 180 / Math.PI).toFixed(2)}°, Vertical Angle: ${(verticalAngle * 180 / Math.PI).toFixed(2)}°`);
        //world.sendMessage(`Half Horizontal Bound: ${(halfH * 180 / Math.PI).toFixed(2)}°, Half Vertical Bound: ${(halfV * 180 / Math.PI).toFixed(2)}°`);
        return horizontalAngle <= halfH && verticalAngle <= halfV;
    }



    drawEffect(dimension: Dimension, pos: Vector3, forward: Vector3, numOfParticles?: number) {
        const halfH = (this.totalHorizontalAngleDeg * Math.PI) / 360;
        const halfV = (this.totalVerticalAngleDeg * Math.PI) / 360;
        
        const basis = CustomVectorUtils.createBasisFromForward(forward);
        const right = basis.right, up = basis.up;
        pos = CustomVectorUtils.translateRelativeToBasis(
            pos,
            basis,
            this.attackOffset
        );

        const particlesNum = Math.round(numOfParticles ? numOfParticles : 3*this.maxRange);
        const lineParticlesNum = Math.round(numOfParticles ? numOfParticles : 3*(this.maxRange - this.minRange));
        
        // --- Horizontal boundaries ---
        const leftVector    = CustomVectorUtils.rotateAroundAxis(forward, up,  halfH);
        const rightVector  = CustomVectorUtils.rotateAroundAxis(forward, up, -halfH);

        const leftUpVector  = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, halfV);
        const leftDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, -halfV);
        const rightUpVector  = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, halfV);
        const rightDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, -halfV);

        // Draw boundary rays from minRadius to maxRadius
        const rayLength = this.maxRange - this.minRange;
        DrawEffects.drawRay(dimension, Vector3Utils.add(pos, Vector3Utils.scale(leftUpVector, this.minRange)), leftUpVector, rayLength, lineParticlesNum);
        DrawEffects.drawRay(dimension, Vector3Utils.add(pos, Vector3Utils.scale(leftDownVector, this.minRange)), leftDownVector, rayLength, lineParticlesNum);
        DrawEffects.drawRay(dimension, Vector3Utils.add(pos, Vector3Utils.scale(rightUpVector, this.minRange)), rightUpVector, rayLength, lineParticlesNum);
        DrawEffects.drawRay(dimension, Vector3Utils.add(pos, Vector3Utils.scale(rightDownVector, this.minRange)), rightDownVector, rayLength, lineParticlesNum);
        // Outer boundary arcs
        //Horizontal arc
        DrawEffects.drawArc(dimension, pos, forward, this.maxRange, [{rotAxis: up, angleDeg: halfH}], particlesNum);
        //Vertical arc
        DrawEffects.drawArc(dimension, pos, forward, this.maxRange, [{rotAxis: right, angleDeg: halfV}], particlesNum);
        //Up arc
        DrawEffects.drawArc(dimension, pos, forward, this.maxRange, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: -halfV}], particlesNum);
        //Down arc
        DrawEffects.drawArc(dimension, pos, forward, this.maxRange, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: halfV}], particlesNum);
        //Left arc
        DrawEffects.drawArc(dimension, pos, leftVector, this.maxRange, [{rotAxis: right, angleDeg: -halfV}], particlesNum);
        //Right arc
        DrawEffects.drawArc(dimension, pos, rightVector, this.maxRange, [{rotAxis: right, angleDeg: halfV}], particlesNum);

        // Draw inner boundary if minAttackRadius > 0
        if (this.minRange > 0) {
            // Inner boundary arcs
            //Horizontal arc
            DrawEffects.drawArc(dimension, pos, forward, this.minRange, [{rotAxis: up, angleDeg: halfH}], particlesNum);
            //Vertical arc
            DrawEffects.drawArc(dimension, pos, forward, this.minRange, [{rotAxis: right, angleDeg: halfV}], particlesNum);
            //Up arc
            DrawEffects.drawArc(dimension, pos, forward, this.minRange, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: -halfV}], particlesNum);
            //Down arc
            DrawEffects.drawArc(dimension, pos, forward, this.minRange, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: halfV}], particlesNum);
            //Left arc
            DrawEffects.drawArc(dimension, pos, leftVector, this.minRange, [{rotAxis: right, angleDeg: -halfV}], particlesNum);
            //Right arc
            DrawEffects.drawArc(dimension, pos, rightVector, this.minRange, [{rotAxis: right, angleDeg: halfV}], particlesNum);
        }
    }
}
/**<Weapon>Slash<Range><Direction?> */
export const SlashAttacks = {
    "Dagger": {
        /**
         * MaxRange: `2.8` MinRange: `0`
         * 
         * Horizontal Angle: `90°` Vertical Angle: `45°`
         * 
         * Cooldown: `6` ticks
         */
        "ShortRangeCenter": new Slash(2.8, 0, 6, 90, 45),
        /**
         * MaxRange: `2.8` MinRange: `0`
         * 
         * Horizontal Angle: `90°` Vertical Angle: `45°`
         * 
         * Cooldown: `6` ticks
         */
        "ShortRangeLeft": new Slash(2.8, 0, 6, 90, 45, {x: -0.5, y: 0, z: 0}),
        /**
         * MaxRange: `2.8` MinRange: `0`
         * 
         * Horizontal Angle: `90°` Vertical Angle: `45°`
         * 
         * Cooldown: `6` ticks
         */
        "ShortRangeRight": new Slash(2.8, 0, 6, 90, 45, {x: 0.5, y: 0, z: 0}),
    },
    "Sword": {
        /**
         * MaxRange: `3.3` MinRange: `0`
         * 
         * Horizontal Angle: `120°` Vertical Angle: `45°`
         * 
         * Cooldown: `8` ticks
         * */
        "NormalRange": new Slash(3.3, 0, 8, 120, 45),
        /**
         * MaxRange: `4.3` MinRange: `0`
         * 
         * Horizontal Angle: `120°` Vertical Angle: `45°`
         * 
         * Cooldown: `8` ticks
         */
        "LongRange": new Slash(4.3, 0, 8, 120, 45),
    },
    "Claymore": {
        /**
         * MaxRange: `4.3` MinRange: `0`
         * 
         * Horizontal Angle: `180°` Vertical Angle: `60°`
         * 
         * Cooldown: `12` ticks
         */
        "LongRange": new Slash(4.3, 0, 12, 180, 60),
        /**
         * MaxRange: `5.3` MinRange: `0`
         * 
         * Horizontal Angle: `180°` Vertical Angle: `60°`
         * 
         * Cooldown: `12` ticks
         */
        "VeryLongRange": new Slash(5.3, 0, 12, 180, 60),
    },
    "Glaive": {
        /**
         * MaxRange: `6.3` MinRange: `2`
         * 
         * Horizontal Angle: `150°` Vertical Angle: `45°`
         * 
         * Cooldown: `12` ticks
         */
        "NormalRangeCenter": new Slash(6.3, 2, 12, 150, 45),
        /**
         * MaxRange: `6.3` MinRange: `2`
         * 
         * Horizontal Angle: `150°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "NormalRangeSwirl": new Slash(6.3, 2, 20, 360, 45),
    },
    "Swirl": {
        /**
         * MaxRange: `2.8` MinRange: `0`
         * 
         * Horizontal Angle: `360°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "ShortRange": new Slash(2.8, 0, 20, 360, 45),
        /**
         * MaxRange: `3.3` MinRange: `0`
         * 
         * Horizontal Angle: `360°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "NormalRange": new Slash(3.3, 0, 20, 360, 45),
        /**
         * MaxRange: `4.3` MinRange: `0`
         * 
         * Horizontal Angle: `360°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "LongRange": new Slash(4.3, 0, 20, 360, 45),
        /**
         * MaxRange: `5.3` MinRange: `0`
         * 
         * Horizontal Angle: `360°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "VeryLongRange": new Slash(5.3, 0, 20, 360, 45),
        /**
         * MaxRange: `6.3` MinRange: `0`
         * 
         * Horizontal Angle: `360°` Vertical Angle: `45°`
         * 
         * Cooldown: `20` ticks
         */
        "ExtremeRange": new Slash(6.3, 0, 20, 360, 45),
    }
} as const;
