export type StringOperator = 'in' | 'notin' | 'eq' | 'ne' | 'starts' | 'ends' | 'contains' | 'notcontains' | 'regex';
export type DateOperator = 'lt' | 'le' | 'gt' | 'ge' | 'in' | 'notin' | 'eq' | 'ne' |
    'starts' | 'ends' | 'contains' | 'notcontains' | 'regex';
export type NumberOperator = 'lt' | 'le' | 'gt' | 'ge' | 'in' | 'notin' | 'eq' | 'ne';
export type BooleanOperator = 'eq' | 'ne';

export type Connector = 'and' | 'or';

export interface FilterCondition {
    variable: string;
    operator: StringOperator | DateOperator | NumberOperator | BooleanOperator;
    value: string | number | boolean | null | string[] | number[];
}

export interface Filter {
    conditions: FilterCondition[];
    connectors: Connector[];
    options?: {
        caseInsensitive: boolean;
    };
}

export interface ParsedFilter extends Filter {
    variableIndeces: number[];
    variableTypes: string[];
    onlyAndConnectors: boolean;
    onlyOrConnectors: boolean;
}