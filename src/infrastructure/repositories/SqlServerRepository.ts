import { ISqlRepository } from '@/domain/repositories';
import { StoredProcedureCore, StoredProcedureDefinition } from '@/domain/entities';
import { getSqlPool } from '../sqlConnection';
import * as sql from 'mssql';

export class SqlServerRepository implements ISqlRepository {
  async listDatabases(): Promise<string[]> {
    const pool = await getSqlPool();
    const result = await pool.request().query("SELECT name FROM sys.databases WHERE state_desc = 'ONLINE' AND HAS_DBACCESS(name) = 1");
    return result.recordset.map((row: any) => row.name);
  }

  async listStoredProcedures(database: string, search?: string): Promise<StoredProcedureCore[]> {
    const pool = await getSqlPool();
    const safeDb = `[${database.replace(/\]/g, ']]')}]`; 
    
    let query = `
      SELECT 
        p.name,
        s.name as [schema],
        p.object_id as objectId,
        p.create_date as createDate,
        p.modify_date as modifyDate
      FROM ${safeDb}.sys.procedures p
      INNER JOIN ${safeDb}.sys.schemas s ON p.schema_id = s.schema_id
      WHERE p.is_ms_shipped = 0  -- Exclude system/MS-shipped procedures
        AND s.name NOT IN ('sys', 'INFORMATION_SCHEMA')  -- Exclude system schemas
    `;
    
    if (search) {
      query += ` AND p.name LIKE @search`;
    }
    
    query += ` ORDER BY s.name, p.name`;  // Add ordering for better UX
    
    const request = pool.request();
    if (search) request.input('search', sql.NVarChar, `%${search}%`);
    
    const result = await request.query(query);
    
    return result.recordset.map((row: any) => ({
      name: row.name,
      schema: row.schema,
      database: database,
      objectId: row.objectId,
      createDate: row.createDate,
      modifyDate: row.modifyDate
    }));
  }

  async getStoredProcedureDefinition(database: string, schema: string, name: string): Promise<StoredProcedureDefinition | null> {
    console.log(`[REPOSITORY] ========== getStoredProcedureDefinition Called ==========`);
    console.log(`[REPOSITORY] Parameters: database="${database}", schema="${schema}", name="${name}"`);
    
    const pool = await getSqlPool();
    const safeDb = `[${database.replace(/\]/g, ']]')}]`;
    console.log(`[REPOSITORY] Safe DB name: ${safeDb}`);
    
    // Get definition from sys.sql_modules
    const query = `
      SELECT 
        m.definition,
        o.object_id as objectId,
        o.create_date as createDate,
        o.modify_date as modifyDate
      FROM ${safeDb}.sys.sql_modules m
      INNER JOIN ${safeDb}.sys.objects o ON m.object_id = o.object_id
      INNER JOIN ${safeDb}.sys.schemas s ON o.schema_id = s.schema_id
      WHERE s.name = @schema AND o.name = @name
    `;
    
    console.log('[REPOSITORY] Executing SQL query:', query.trim());
    console.log(`[REPOSITORY] Query params: @schema="${schema}", @name="${name}"`);
    
    const request = pool.request();
    request.input('schema', sql.NVarChar, schema);
    request.input('name', sql.NVarChar, name);
    
    const result = await request.query(query);
    console.log(`[REPOSITORY] Query returned ${result.recordset.length} rows`);
    
    if (result.recordset.length === 0) {
      console.error(`[REPOSITORY] ❌ No rows found for ${database}.${schema}.${name}`);
      return null;
    }
    
    const row = result.recordset[0];
    const definition = row.definition;
    const objectId = row.objectId;
    const createDate = row.createDate;
    const modifyDate = row.modifyDate;
    console.log(`[REPOSITORY] Found SP with object_id: ${objectId}`);
    
    // Get parameters
    const paramQuery = `
      SELECT 
        p.name,
        TYPE_NAME(p.user_type_id) as type,
        p.max_length as maxLength,
        p.is_output as isOutput
      FROM ${safeDb}.sys.parameters p
      WHERE p.object_id = @objectId
    `;
    
    console.log('[REPOSITORY] Fetching parameters...');
    const paramRequest = pool.request();
    paramRequest.input('objectId', sql.Int, objectId);
    const paramResult = await paramRequest.query(paramQuery);
    console.log(`[REPOSITORY] Found ${paramResult.recordset.length} parameters`);
    
    const parameters = paramResult.recordset.map((row: any) => ({
      name: row.name,
      type: row.type,
      maxLength: row.maxLength,
      isOutput: row.isOutput
    }));
    
    console.log('[REPOSITORY] ✅ Returning complete SP definition');
    return {
      name,
      schema,
      database,
      objectId,
      createDate,
      modifyDate,
      definition,
      parameters
    };
  }
}
