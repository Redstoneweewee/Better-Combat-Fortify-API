// ../Regolith/packs/ts-scripts/SampleManager.ts
import { world, system } from "@minecraft/server";
var SampleManager = class {
  tickCount = 0;
  _availableFuncs;
  pendingFuncs = [];
  gamePlayLogger(message, status) {
    if (status !== void 0 && status > 0) {
      message = "SUCCESS: " + message;
    } else if (status !== void 0 && status < 0) {
      message = "FAIL: " + message;
    }
    world.sendMessage(message);
    console.warn(message);
  }
  newScriptEvent(scriptEvent) {
    const messageId = scriptEvent.id.toLowerCase();
    if (messageId.startsWith("sample") && scriptEvent.sourceEntity) {
      const nearbyBlock = scriptEvent.sourceEntity.getBlockFromViewDirection();
      if (!nearbyBlock) {
        this.gamePlayLogger("Please look at the block where you want me to run this.");
        return;
      }
      const nearbyBlockLoc = nearbyBlock.block.location;
      const nearbyLoc = { x: nearbyBlockLoc.x, y: nearbyBlockLoc.y + 1, z: nearbyBlockLoc.z };
      if (messageId === "sample:run") {
        for (const sampleFuncKey in this._availableFuncs) {
          const sampleFunc = this._availableFuncs[sampleFuncKey];
          this.runSample(sampleFuncKey + this.tickCount, sampleFunc, {
            ...nearbyLoc,
            dimension: scriptEvent.sourceEntity.dimension
          });
          return;
        }
      }
    }
  }
  runSample(sampleId, snippetFunctions, targetLocation) {
    for (let i = snippetFunctions.length - 1; i >= 0; i--) {
      this.pendingFuncs.push({ name: sampleId, func: snippetFunctions[i], location: targetLocation });
    }
  }
  worldTick() {
    if (this.tickCount % 10 === 0) {
      if (this.pendingFuncs.length > 0) {
        const funcSet = this.pendingFuncs.pop();
        if (funcSet) {
          try {
            funcSet.func(this.gamePlayLogger, funcSet.location);
          } catch (e) {
            world.sendMessage("Could not run sample function. Error: " + e.toString());
          }
        }
      }
    }
    if (this.tickCount === 200) {
      world.sendMessage("Type '/scriptevent sample:run' in chat to run this sample.");
    }
    this.tickCount++;
    system.run(this.worldTick);
  }
  constructor() {
    this._availableFuncs = {};
    this.gamePlayLogger = this.gamePlayLogger.bind(this);
    this.worldTick = this.worldTick.bind(this);
    system.afterEvents.scriptEventReceive.subscribe(this.newScriptEvent.bind(this));
    system.run(this.worldTick);
  }
  registerSamples(sampleSet) {
    for (const sampleKey in sampleSet) {
      if (sampleKey.length > 1 && sampleSet[sampleKey]) {
        this._availableFuncs[sampleKey] = sampleSet[sampleKey];
      }
    }
  }
};

// ../Regolith/packs/ts-scripts/ScriptBox.ts
import { world as world2 } from "@minecraft/server";
function scriptBox(log, targetLocation) {
  world2.sendMessage("Hello world! Replace this line with your code.");
}

// ../Regolith/packs/ts-scripts/main.ts
var sm = new SampleManager();
sm.registerSamples({
  scriptBox: [scriptBox]
});

//# sourceMappingURL=../../../../ts/debug/main.js.map
