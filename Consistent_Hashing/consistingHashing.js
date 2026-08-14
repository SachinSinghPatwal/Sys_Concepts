import crypto from "crypto";

const VIRTUAL_NODES = 5;

export function hash(value) {
  const digest = crypto.createHash("sha256").update(value).digest("hex");

  return BigInt("0x" + digest);
}

export class ConsistentHashRing {
  constructor() {
    this.ring = [];
    this.servers = new Set();
  }

  addServer(server) {
    // Prevent duplicate physical servers
    if (this.servers.has(server)) {
      return;
    }

    this.servers.add(server);

    // Create virtual nodes
    for (let i = 0; i < VIRTUAL_NODES; i++) {
      const id = `${server}#${i}`;
      const nodeHash = hash(id);

      this.ring.push({
        id,
        hash: nodeHash,
        server,
        virtualNode: i,
      });
    }

    this.sortRing();
  }

  removeServer(server) {
    // Server doesn't exist
    if (!this.servers.has(server)) {
      return;
    }

    // Remove physical server
    this.servers.delete(server);

    // Remove all virtual nodes belonging to it
    this.ring = this.ring.filter((node) => node.server !== server);
  }

  sortRing() {
    this.ring.sort((a, b) => {
      // Primary ordering: hash
      if (a.hash < b.hash) return -1;
      if (a.hash > b.hash) return 1;

      // Collision handling
      return a.id.localeCompare(b.id);
    });
  }

  getServer(key) {
    if (this.ring.length === 0) {
      return null;
    }

    const keyHash = hash(key);

    let left = 0;
    let right = this.ring.length - 1;

    // Find first node whose hash >= keyHash
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);

      if (this.ring[mid].hash < keyHash) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    // No node exists after keyHash.
    // Wrap around to the first node.
    if (left === this.ring.length) {
      return this.ring[0].server;
    }

    return this.ring[left].server;
  }
}
