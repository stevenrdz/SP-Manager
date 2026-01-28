
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
  
  // Analysis
  projectReferences: string[]; // Projects that use this SP
  tablesUsed: string[]; // Tables detected in the SP
  
  lastScanDate: Date;
}
