import { FlowStep } from "@/domain/entities";

export function parseSqlFlow(sql: string): FlowStep[] {
  const steps: FlowStep[] = [];
  let currentId = 0;

  // 1. Extract Parameters
  const paramBlockMatch = sql.match(/CREATE\s+PROCEDURE\s+[\w\.\[\]]+\s+([\s\S]+?)\s+AS/i);
  if (paramBlockMatch) {
    const paramText = paramBlockMatch[1].trim();
    if (paramText) {
      const params = paramText.split(',').map(p => p.trim().split(/\s+/)[0]).filter(p => p.startsWith('@'));
      if (params.length > 0) {
        steps.push({
          id: `step_${currentId++}`,
          type: 'params',
          content: params.join(', ')
        });
      }
    }
  }

  // regex to detect tables (approximate)
  const tableRegex = /(?:FROM|JOIN|UPDATE|INSERT\s+INTO|DELETE\s+FROM)\s+([\w\.\[\]]+)/gi;

  const extractTables = (content: string): string[] => {
    const tables: string[] = [];
    let match;
    const regex = new RegExp(tableRegex);
    while ((match = regex.exec(content)) !== null) {
      const table = match[1].replace(/[\[\]]/g, '');
      if (!tables.includes(table)) tables.push(table);
    }
    return tables;
  };

  // Pre-process: Remove comments and join lines to handle multi-line statements better
  const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  const statementKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'IF', 'ELSE', 'RETURN', 'BEGIN', 'END'];
  
  const regex = new RegExp(`\\b(${statementKeywords.join('|')})\\b`, 'gi');
  let match;
  let lastIndex = 0;
  const rawSteps: { type: string, content: string }[] = [];

  // Find the start of the 'AS' to skip procedure definition
  const asMatch = /\bAS\b\s+/i.exec(cleanSql);
  if (asMatch) {
    lastIndex = asMatch.index + asMatch[0].length;
  }

  while ((match = regex.exec(cleanSql)) !== null) {
    if (match.index < lastIndex) continue;
    
    // Save previous statement's content to the last rawStep
    const prevContent = cleanSql.substring(lastIndex, match.index).trim();
    if (prevContent && rawSteps.length > 0) {
      rawSteps[rawSteps.length - 1].content += ' ' + prevContent;
    }

    rawSteps.push({ type: match[0].toUpperCase(), content: '' });
    lastIndex = regex.lastIndex;
  }
  
  // Add final content
  const finalContent = cleanSql.substring(lastIndex).trim();
  if (finalContent && rawSteps.length > 0) {
    rawSteps[rawSteps.length - 1].content += ' ' + finalContent;
  }

  rawSteps.forEach(raw => {
    if (!raw.content.trim() && raw.type !== 'ELSE' && raw.type !== 'BEGIN' && raw.type !== 'END') return;
    
    let type = raw.type.toLowerCase();
    if (type === 'begin' || type === 'end') return; // Skip structural blocks

    const step: FlowStep = {
      id: `step_${currentId++}`,
      type: type as any,
      content: (raw.type + ' ' + raw.content).trim(),
      tables: []
    };

    if (['select', 'insert', 'update', 'delete'].includes(type)) {
      step.tables = extractTables(step.content);
    }

    if (steps.length > 0) {
      steps[steps.length - 1].next = [step.id];
    }
    steps.push(step);
  });

  return steps;
}

export type RFNode = {
  id: string;
  type: string;
  data: { label: string; subLabel?: string; type: string; tables?: string[] };
  position: { x: number; y: number };
};

export type RFEdge = {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
  label?: string;
};

export function generateReactFlowData(steps: FlowStep[], spName: string): { nodes: RFNode[], edges: RFEdge[] } {
  const nodes: RFNode[] = [];
  const edges: RFEdge[] = [];

  const typeMap: Record<string, string> = {
    params: "Parámetros de Entrada",
    select: "Extracción de Datos",
    insert: "Proceso de Inserción",
    update: "Actualización de Registros",
    delete: "Eliminación de Datos",
    if: "Validación de Regla",
    else: "Ruta Alternativa",
    return: "Resultado Final"
  };

  // Helper to get business label
  const getBusinessLabel = (step: FlowStep) => {
    let content = step.content;
    const cleanContent = content.replace(/\s+/g, ' ');
    
    if (step.type === 'select') {
      // Try to find the first table after FROM
      const fromMatch = cleanContent.match(/FROM\s+([\w\.\[\]]+)/i);
      if (fromMatch) {
        const mainTable = fromMatch[1].replace(/[\[\]]/g, '');
        // If it's a "Seek" or "Get" procedure, use friendlier terms
        if (spName.toUpperCase().includes('SEEK') || spName.toUpperCase().includes('GET')) {
          return `Consultar datos de ${mainTable}`;
        }
        return `Obtener de ${mainTable}`;
      }
      return "Consulta de Información";
    } else if (step.type === 'insert') {
      const match = cleanContent.match(/INSERT\s+INTO\s+([\w\.\[\]]+)/i);
      if (match) return `Registrar en ${match[1].replace(/[\[\]]/g, '')}`;
    } else if (step.type === 'update') {
      const match = cleanContent.match(/UPDATE\s+([\w\.\[\]]+)/i);
      if (match) return `Actualizar ${match[1].replace(/[\[\]]/g, '')}`;
    } else if (step.type === 'delete') {
      const match = cleanContent.match(/DELETE\s+(?:FROM\s+)?([\w\.\[\]]+)/i);
      if (match) return `Borrar de ${match[1].replace(/[\[\]]/g, '')}`;
    }
    return content.trim().substring(0, 70) + (content.length > 70 ? '...' : '');
  };

  // Start Node
  nodes.push({
    id: 'start',
    type: 'special',
    data: { label: 'Inicio', subLabel: spName, type: 'start' },
    position: { x: 0, y: 0 }
  });

  if (steps.length > 0) {
    edges.push({ id: 'e-start', source: 'start', target: steps[0].id, animated: true });
  }

  steps.forEach((step, index) => {
    const businessType = typeMap[step.type] || step.type.toUpperCase();
    const businessLabel = getBusinessLabel(step);

    nodes.push({
      id: step.id,
      type: 'custom',
      data: { 
        label: businessType, 
        subLabel: businessLabel, 
        type: step.type,
        tables: step.tables
      },
      position: { x: 0, y: (index + 1) * 150 }
    });

    // Add table connections as separate nodes
    if (step.tables && step.tables.length > 0) {
      step.tables.forEach((table, tIdx) => {
        const tableId = `table-${step.id}-${tIdx}`;
        nodes.push({
          id: tableId,
          type: 'table',
          data: { label: table, type: 'table' },
          position: { x: 250, y: (index + 1) * 150 + (tIdx * 60) }
        });
        edges.push({
          id: `e-${step.id}-${tableId}`,
          source: step.id,
          target: tableId,
          animated: false
        });
      });
    }

    if (step.next) {
      step.next.forEach(nextId => {
        edges.push({
          id: `e-${step.id}-${nextId}`,
          source: step.id,
          target: nextId,
          animated: true
        });
      });
    } else if (index === steps.length - 1) {
        // Last step points to end
        nodes.push({
            id: 'end',
            type: 'special',
            data: { label: 'Fin', type: 'end' },
            position: { x: 0, y: (index + 2) * 150 }
        });
        edges.push({ id: `e-${step.id}-end`, source: step.id, target: 'end', animated: true });
    }
  });

  return { nodes, edges };
}

export function generateMermaid(steps: FlowStep[], spName: string): string {
  // ... (keeping existing implementation for now)
  let mm = `graph TD\n`;
  mm += `  Start([Inicio del Procedimiento]):::start\n`;
  
  if (steps.length > 0) {
    mm += `  Start --> ${steps[0].id}\n`;
  } else {
    mm += `  Start --> End\n`;
  }

  const typeMap: Record<string, string> = {
    params: "Parámetros de Entrada",
    select: "Consulta de Datos",
    insert: "Proceso de Inserción",
    update: "Proceso de Actualización",
    delete: "Proceso de Eliminación",
    if: "Validación Condicional",
    else: "Alternativa",
    return: "Retorno de Valor"
  };

  steps.forEach((step) => {
    const friendlyType = typeMap[step.type] || step.type.toUpperCase();
    let content = step.content;
    
    // Specific cleanup for friendlier display
    if (step.type === 'insert') {
      const match = content.match(/INSERT\s+INTO\s+([\w\.\[\]]+)/i);
      if (match) content = `Insertar en ${match[1].replace(/[\[\]]/g, '')}`;
    } else if (step.type === 'update') {
      const match = content.match(/UPDATE\s+([\w\.\[\]]+)/i);
      if (match) content = `Actualizar ${match[1].replace(/[\[\]]/g, '')}`;
    } else if (step.type === 'delete') {
      const match = content.match(/DELETE\s+(?:FROM\s+)?([\w\.\[\]]+)/i);
      if (match) content = `Eliminar de ${match[1].replace(/[\[\]]/g, '')}`;
    }

    const escapedContent = content.replace(/"/g, "'").substring(0, 80) + (content.length > 80 ? '...' : '');
    const label = `<b>${friendlyType}</b><br/>${escapedContent}`;
    
    let shape = `["${label}"]`;
    if (step.type === 'if') shape = `{"${label}"}`;
    if (step.type === 'return') shape = `(["${label}"])`;
    if (step.type === 'params') shape = `["${label}"]`;

    let color = '';
    if (step.type === 'params') color = ':::params';
    if (step.type === 'select') color = ':::select';
    if (step.type === 'insert' || step.type === 'update' || step.type === 'delete') color = ':::process';
    if (step.type === 'if' || step.type === 'else') color = ':::logic';

    mm += `  ${step.id}${shape}${color}\n`;

    if (step.tables && step.tables.length > 0) {
      step.tables.forEach((table, idx) => {
        const tableId = `table_${step.id}_${idx}`;
        mm += `  ${tableId}[("${table}")]:::table\n`;
        mm += `  ${step.id} -.-> ${tableId}\n`;
        mm += `  click ${tableId} call handleTableClick("${table}") "${table}"\n`;
      });
    }

    if (step.next) {
      step.next.forEach((nextId) => {
        mm += `  ${step.id} --> ${nextId}\n`;
      });
    } else {
        mm += `  ${step.id} --> End\n`;
    }
  });

  mm += `  End([Fin del Procedimiento]):::start\n`;
  
  mm += `  classDef start fill:#1e293b,stroke:#3b82f6,stroke-width:2px,color:#3b82f6,font-weight:bold;\n`;
  mm += `  classDef params fill:#1e293b,stroke:#f59e0b,stroke-width:2px,color:#f59e0b;\n`;
  mm += `  classDef process fill:#1e293b,stroke:#10b981,stroke-width:2px,color:#10b981;\n`;
  mm += `  classDef select fill:#1e293b,stroke:#06b6d4,stroke-width:2px,color:#06b6d4;\n`;
  mm += `  classDef logic fill:#1e293b,stroke:#a855f7,stroke-width:2px,color:#a855f7;\n`;
  mm += `  classDef table fill:#1e293b,stroke:#84cc16,stroke-width:1px,color:#84cc16,cursor:pointer;\n`;

  return mm;
}
