
export interface StoredProcedureCore {
  name: string;
  schema: string;
  database: string;
  objectId: number;
  createDate: Date;
  modifyDate: Date;
}

export interface StoredProcedureDefinition extends StoredProcedureCore {
  definition: string; // The SQL code
  parameters: SPParameter[];
}

export interface SPParameter {
  name: string;
  type: string;
  maxLength: number;
  isOutput: boolean;
}

export interface SPMetadata {
  spName: string;
  schema: string;
  database: string;
  
  // Documentation
  description?: string;
  author?: string;
  cleanDefinition?: string;
  
  // Analysis
  projectReferences: string[]; // Projects that use this SP
  tablesUsed: string[]; // Tables detected in the SP
  
  lastScanDate: Date;
}

export interface FlowStep {
  id: string;
  type: 'select' | 'insert' | 'update' | 'delete' | 'if' | 'else' | 'begin' | 'end' | 'return' | 'params';
  content: string;
  tables?: string[];
  next?: string[];
}

export interface TableData {
  database: string;
  schema: string;
  name: string;
  columns: {
    name: string;
    type: string;
    maxLength: number;
    isNullable: boolean;
    isPrimaryKey: boolean;
  }[];
  sampleData?: any[];
}
