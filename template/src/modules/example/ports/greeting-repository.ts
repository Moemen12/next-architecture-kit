export type GreetingRecord = Readonly<{
  message: string;
}>;

export interface GreetingRepository {
  save(record: GreetingRecord): Promise<void>;
  latest(): Promise<GreetingRecord | null>;
}
