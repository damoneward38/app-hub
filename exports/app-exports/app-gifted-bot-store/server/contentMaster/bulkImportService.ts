import { db } from '../db';
import { knowledgeEntries } from '../../drizzle/schema';

export interface ImportEntry {
  type: string;
  title: string;
  content: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedRows: number;
  skippedRows: number;
  errors: Array<{
    rowIndex: number;
    error: string;
  }>;
}

export interface ValidationError {
  index: number;
  error: string;
}

export class BulkImportService {
  /**
   * Parse CSV content
   */
  parseCSV(content: string): Array<Record<string, string>> {
    const lines = content.split('\n').filter((line) => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV must have at least a header row and one data row');
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows: Array<Record<string, string>> = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim());
      const row: Record<string, string> = {};

      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] || '';
      }

      rows.push(row);
    }

    return rows;
  }

  /**
   * Parse JSON content
   */
  parseJSON(content: string): ImportEntry[] {
    try {
      const data = JSON.parse(content);
      if (!Array.isArray(data)) {
        throw new Error('JSON must be an array of entries');
      }
      return data;
    } catch (error) {
      throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert CSV rows to import entries
   */
  csvToEntries(rows: Array<Record<string, string>>): ImportEntry[] {
    return rows.map((row) => ({
      type: row.type || 'website',
      title: row.title || '',
      content: row.content || '',
      url: row.url,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
  }

  /**
   * Validate import entries
   */
  validateEntries(entries: ImportEntry[]): ValidationError[] {
    const errors: ValidationError[] = [];

    const validTypes = ['website', 'book', 'music', 'artist', 'feature', 'blog'];

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];

      if (!entry.type) {
        errors.push({ index: i, error: 'Missing type field' });
      } else if (!validTypes.includes(entry.type)) {
        errors.push({
          index: i,
          error: `Invalid type: ${entry.type}. Must be one of: ${validTypes.join(', ')}`,
        });
      }

      if (!entry.title || entry.title.trim() === '') {
        errors.push({ index: i, error: 'Missing or empty title' });
      }

      if (!entry.content || entry.content.trim() === '') {
        errors.push({ index: i, error: 'Missing or empty content' });
      }

      if (entry.title && entry.title.length > 255) {
        errors.push({ index: i, error: 'Title too long (max 255 characters)' });
      }
    }

    return errors;
  }

  /**
   * Import entries from CSV
   */
  async importFromCSV(
    userId: number,
    csvContent: string
  ): Promise<ImportResult> {
    try {
      const rows = this.parseCSV(csvContent);
      const entries = this.csvToEntries(rows);
      return this.importEntries(userId, entries);
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        importedRows: 0,
        skippedRows: 0,
        errors: [
          {
            rowIndex: 0,
            error: `CSV parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  /**
   * Import entries from JSON
   */
  async importFromJSON(
    userId: number,
    jsonContent: string
  ): Promise<ImportResult> {
    try {
      const entries = this.parseJSON(jsonContent);
      return this.importEntries(userId, entries);
    } catch (error) {
      return {
        success: false,
        totalRows: 0,
        importedRows: 0,
        skippedRows: 0,
        errors: [
          {
            rowIndex: 0,
            error: `JSON parsing failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
      };
    }
  }

  /**
   * Import entries into database
   */
  async importEntries(
    userId: number,
    entries: ImportEntry[]
  ): Promise<ImportResult> {
    const validationErrors = this.validateEntries(entries);
    const result: ImportResult = {
      success: true,
      totalRows: entries.length,
      importedRows: 0,
      skippedRows: 0,
      errors: validationErrors.map((e) => ({
        rowIndex: e.index,
        error: e.error,
      })),
    };

    // Skip invalid rows
    const validIndices = new Set(
      Array.from({ length: entries.length }, (_, i) => i).filter(
        (i) => !validationErrors.some((e) => e.index === i)
      )
    );

    if (!db) {
      return {
        success: false,
        totalRows: entries.length,
        importedRows: 0,
        skippedRows: entries.length,
        errors: [{ rowIndex: 0, error: 'Database not initialized' }],
      };
    }

    for (let i = 0; i < entries.length; i++) {
      if (!validIndices.has(i)) {
        result.skippedRows++;
        continue;
      }

      const entry = entries[i];

      try {
        // Insert into database
        await db.insert(knowledgeEntries).values({
          userId,
          type: entry.type,
          title: entry.title,
          content: entry.content,
          url: entry.url,
          metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
        });

        result.importedRows++;
      } catch (error) {
        result.errors.push({
          rowIndex: i,
          error: `Database insert failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
        result.skippedRows++;
      }
    }

    result.success = result.skippedRows === 0;
    return result;
  }

  /**
   * Generate CSV template
   */
  generateCSVTemplate(): string {
    const headers = ['type', 'title', 'content', 'url', 'metadata'];
    const examples = [
      [
        'website',
        'My Music Website',
        'A website showcasing my music and artist profile',
        'https://example.com',
        '{"category":"music"}',
      ],
      [
        'book',
        'My Autobiography',
        'The story of my life and journey in music',
        'https://amazon.com/...',
        '{"author":"Me","year":2024}',
      ],
      [
        'music',
        'Gospel Album',
        'My latest gospel music album with 10 tracks',
        'https://spotify.com/...',
        '{"genre":"gospel","tracks":10}',
      ],
    ];

    let csv = headers.join(',') + '\n';
    for (const example of examples) {
      csv += example.join(',') + '\n';
    }

    return csv;
  }

  /**
   * Generate JSON template
   */
  generateJSONTemplate(): string {
    const template = [
      {
        type: 'website',
        title: 'My Music Website',
        content: 'A website showcasing my music and artist profile',
        url: 'https://example.com',
        metadata: { category: 'music' },
      },
      {
        type: 'book',
        title: 'My Autobiography',
        content: 'The story of my life and journey in music',
        url: 'https://amazon.com/...',
        metadata: { author: 'Me', year: 2024 },
      },
      {
        type: 'music',
        title: 'Gospel Album',
        content: 'My latest gospel music album with 10 tracks',
        url: 'https://spotify.com/...',
        metadata: { genre: 'gospel', tracks: 10 },
      },
    ];

    return JSON.stringify(template, null, 2);
  }

  /**
   * Export knowledge base as CSV
   */
  async exportAsCSV(userId: number): Promise<string> {
    if (!db) {
      return '';
    }

    const entries = await db.select().from(knowledgeEntries);

    if (!entries || entries.length === 0) {
      return '';
    }

    let csv = 'type,title,content,url,metadata\n';

    for (const entry of entries) {
      const metadata = entry.metadata ? entry.metadata : '';
      csv += `"${entry.type}","${entry.title.replace(/"/g, '""')}","${entry.content.replace(/"/g, '""')}","${entry.url || ''}","${metadata}"\n`;
    }

    return csv;
  }

  /**
   * Export knowledge base as JSON
   */
  async exportAsJSON(userId: number): Promise<string> {
    if (!db) {
      return '[]';
    }

    const entries = await db.select().from(knowledgeEntries);

    if (!entries || entries.length === 0) {
      return '[]';
    }

    const exportData = entries.map((entry) => ({
      type: entry.type,
      title: entry.title,
      content: entry.content,
      url: entry.url,
      metadata: entry.metadata ? JSON.parse(entry.metadata || '{}') : undefined,
    }));

    return JSON.stringify(exportData, null, 2);
  }
}

export const bulkImportService = new BulkImportService();
