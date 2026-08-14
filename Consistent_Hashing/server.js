import { ConsistentHashRing } from "./consistingHashing.js";

const ring = new ConsistentHashRing();

ring.addServer("server-A");
ring.addServer("server-B");

console.log("Initial ring:");
console.table(ring.ring);

console.log("\nAdding server-C...");

ring.addServer("server-C");

console.table(ring.ring);

console.log("\nRemoving server-B...");

ring.removeServer("server-B");

console.table(ring.ring);
