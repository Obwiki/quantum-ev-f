export type Primitive = string | number | boolean;
export type EntityProps = Record<string, Primitive>;

export interface Entity {
  id: string;
  kind: string;
  props: EntityProps;
}

export type Comparator = '==' | '!=' | '<' | '<=' | '>' | '>=';

export interface Condition {
  field: string;
  comparator: Comparator;
  value: Primitive;
}

export interface Rule {
  id: string;
  condition: Condition;
  every: number;
  emit: string;
  priority: number;
}

export type MutationOperator = '=' | '+=' | '-=';

export interface Mutation {
  field: string;
  operator: MutationOperator;
  value: Primitive;
}

export interface Handler {
  event: string;
  mutation: Mutation;
  trace?: string;
}

export interface Scenario {
  seed: string;
  clock: {
    from: number;
    to: number;
    step: number;
  };
  entities: Entity[];
  rules: Rule[];
  handlers: Handler[];
}

export interface ForgeEvent {
  id: string;
  type: string;
  tick: number;
  entityId: string;
  priority: number;
  payload: Record<string, Primitive>;
}

export interface TraceEntry {
  tick: number;
  entityId: string;
  event: string;
  message: string;
  before: EntityProps;
  after: EntityProps;
}

export interface SimulationResult {
  seed: string;
  trace: TraceEntry[];
  finalEntities: Entity[];
  emitted: ForgeEvent[];
}
