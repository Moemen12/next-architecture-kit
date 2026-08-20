import type { GreetingRecord, GreetingRepository } from "../ports/greeting-repository";

export function createInMemoryGreetingRepository(): GreetingRepository {
  let latestRecord: GreetingRecord | null = null;

  return {
    async save(record) {
      latestRecord = record;
    },
    async latest() {
      return latestRecord;
    },
  };
}
