import { Interval } from "./utils/interval";
import "./scriptEvents";
import "./hitTest";
import "./weapons/weaponConfigs";
import { EntityLinker } from "./utils/entityLinker";
import { system } from "@minecraft/server";
system.run(() => {
    EntityLinker.removeAllNonPersistentLinkedEntities();
    Interval.start();
});
//# sourceMappingURL=main.js.map