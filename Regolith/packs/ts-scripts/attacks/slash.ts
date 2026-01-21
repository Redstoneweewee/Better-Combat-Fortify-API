import { Dimension, Vector3 } from "@minecraft/server";
import { CustomVectorUtils, DrawEffects } from "../utils/utils";
import { Vector3Utils } from "../utils/minecraft-math";

export class Slash {
    attackRadius: number;
    totalHorizontalAngleDeg: number;
    totalVerticalAngleDeg: number;
    /** Offset from the attack position `{x: left-right, y: up-down, z: forward-backward}`*/
    attackOffset: Vector3;

    constructor(attackRadius: number, totalHorizontalAngleDeg: number, totalVerticalAngleDeg: number, attackOffset?: Vector3) {
        this.attackRadius = attackRadius;
        this.totalHorizontalAngleDeg = totalHorizontalAngleDeg;
        this.totalVerticalAngleDeg = totalVerticalAngleDeg;
        this.attackOffset = attackOffset ? attackOffset : {x: 0, y: 0, z: 0};
    }


    drawSlashEffect(dimension: Dimension, pos: Vector3, forward: Vector3,numOfParticles?: number) {
        const halfH = (this.totalHorizontalAngleDeg * Math.PI) / 360;
        const halfV = (this.totalVerticalAngleDeg * Math.PI) / 360;
        
        const basis = CustomVectorUtils.createBasisFromForward(forward);
        const right = basis.right, up = basis.up;
        // attackOffset = {x: localRight, y: localUp, z: localForward}
        const worldOffset = Vector3Utils.add(
        Vector3Utils.add(
            Vector3Utils.scale(right, this.attackOffset.x),
            Vector3Utils.scale(up, this.attackOffset.y)
        ),
        Vector3Utils.scale(forward, this.attackOffset.z)
        );

        // Add it to the base position
        pos = Vector3Utils.add(pos, worldOffset);

        const particlesNum = numOfParticles ? numOfParticles : 3*this.attackRadius;
        
        // --- Horizontal boundaries ---
        const leftVector    = CustomVectorUtils.rotateAroundAxis(forward, up,  halfH);
        const rightVector  = CustomVectorUtils.rotateAroundAxis(forward, up, -halfH);

        const leftUpVector  = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, halfV);
        const leftDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, halfH), right, -halfV);
        const rightUpVector  = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, halfV);
        const rightDownVector = CustomVectorUtils.rotateAroundAxis(CustomVectorUtils.rotateAroundAxis(forward, up, -halfH), right, -halfV);

        // Draw boundary rays
        DrawEffects.drawRay(dimension, pos, leftUpVector, this.attackRadius, particlesNum);
        DrawEffects.drawRay(dimension, pos, leftDownVector, this.attackRadius, particlesNum);
        DrawEffects.drawRay(dimension, pos, rightUpVector, this.attackRadius, particlesNum);
        DrawEffects.drawRay(dimension, pos, rightDownVector, this.attackRadius, particlesNum);

        //Horizontal arc
        DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{rotAxis: up, angleDeg: halfH}], particlesNum);
        //Vertical arc
        DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{rotAxis: right, angleDeg: halfV}], particlesNum);
        //Up arc
        DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: -halfV}], particlesNum);
        //Down arc
        DrawEffects.drawArc(dimension, pos, forward, this.attackRadius, [{rotAxis: up, angleDeg: halfH}, {rotAxis: right, angleDeg: halfV}], particlesNum);
        //Left arc
        DrawEffects.drawArc(dimension, pos, leftVector, this.attackRadius, [{rotAxis: right, angleDeg: -halfV}], particlesNum);
        //Right arc
        DrawEffects.drawArc(dimension, pos, rightVector, this.attackRadius, [{rotAxis: right, angleDeg: halfV}], particlesNum);
    }
}

export const SlashAttacks = {
    QuickSlash: new Slash(3, 120, 30),
    WideSlash: new Slash(4, 180, 45),
    Overhead: new Slash(3.5, 90, 60),
    Spin: new Slash(3.5, 360, 60),
    Thrust: new Slash(2, 30, 20)
} as const;

