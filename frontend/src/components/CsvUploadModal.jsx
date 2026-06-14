import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseFile, validateData } from '../services/csvParser';
import { supabase } from '../services/supabase';

export default function CsvUploadModal({ isOpen, onClose, tableType, onSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationResult, setValidationResult] = useState(null);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setValidationResult(null);
    setImportResult(null);

    try {
      const data = await parseFile(selectedFile);
      const result = validateData(data, tableType);
      setValidationResult({ ...result, data });
    } catch (err) {
      setError(err.message || 'Failed to parse file.');
    }
  };

  const handleImport = async () => {
    if (!validationResult || !validationResult.valid) return;
    setLoading(true);
    setError('');
    
    try {
      const rows = validationResult.data;

      // Determine the conflict key and allowed columns for upsert based on table type
      let conflictKey = 'id';
      let allowedColumns = [];
      if (tableType === 'csv_questions') {
        conflictKey = 'question_id';
        allowedColumns = ['question_id', 'subject_code', 'module_number', 'difficulty', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_answer', 'explanation', 'active', 'certificate', 'wing'];
      }
      else if (tableType === 'csv_subjects') {
        conflictKey = 'subject_code';
        allowedColumns = ['subject_code', 'subject_name', 'description'];
      }
      else if (tableType === 'csv_modules') {
        conflictKey = 'id';
        allowedColumns = ['id', 'subject_code', 'module_number', 'module_name'];
      }
      else if (tableType === 'csv_mock_exams') {
        conflictKey = 'test_id';
        allowedColumns = ['test_id', 'test_name', 'wing', 'certificate_level', 'time_limit_minutes', 'passing_percent', 'question_distribution', 'is_active'];
      }

      // Batch upsert in chunks of 500 to avoid payload limits
      const chunkSize = 500;
      let totalInserted = 0;

      // Auto-extract and insert subjects and modules first if uploading questions
      if (tableType === 'csv_questions') {
        const uniqueSubjects = [];
        const subjectCodes = new Set();
        rows.forEach(row => {
          if (row.subject_code && !subjectCodes.has(row.subject_code)) {
            subjectCodes.add(row.subject_code);
            uniqueSubjects.push({
              subject_code: row.subject_code,
              subject_name: row.subject_name || row.subject_code,
              description: row.subject_name || `${row.subject_code} Subject`
            });
          }
        });

        if (uniqueSubjects.length > 0) {
          const { error: subjectError } = await supabase
            .from('csv_subjects')
            .upsert(uniqueSubjects, { onConflict: 'subject_code' });
          if (subjectError) throw new Error('Failed to auto-create subjects: ' + subjectError.message);
        }

        const uniqueModules = [];
        const moduleKeys = new Set();
        rows.forEach(row => {
          if (row.subject_code && row.module_number) {
            const key = `${row.subject_code}-${row.module_number}`;
            if (!moduleKeys.has(key)) {
              moduleKeys.add(key);
              uniqueModules.push({
                subject_code: row.subject_code,
                module_number: parseInt(row.module_number, 10),
                module_name: row.module_name || `Module ${row.module_number}`
              });
            }
          }
        });

        if (uniqueModules.length > 0) {
          const { error: moduleError } = await supabase
            .from('csv_modules')
            .upsert(uniqueModules, { onConflict: 'subject_code, module_number' });
          if (moduleError) console.warn('Failed to auto-create modules:', moduleError.message);
        }
      }

      for (let i = 0; i < rows.length; i += chunkSize) {
        const rawChunk = rows.slice(i, i + chunkSize);
        
        // Strip out extraneous CSV columns to prevent PostgREST errors
        const chunk = rawChunk.map(row => {
          const cleanRow = {};
          allowedColumns.forEach(col => {
            if (row[col] !== undefined && row[col] !== '') {
              // Convert boolean fields
              if ((col === 'active' || col === 'is_active') && typeof row[col] === 'string') {
                cleanRow[col] = row[col].toUpperCase() === 'TRUE';
              } else if (col === 'wing' && typeof row[col] === 'string') {
                const wingVal = row[col].trim();
                if (wingVal.toUpperCase() === 'ALL' || wingVal.toLowerCase() === 'common') cleanRow[col] = 'Common';
                else if (wingVal.toUpperCase() === 'ARMY') cleanRow[col] = 'Army';
                else if (wingVal.toUpperCase() === 'NAVY') cleanRow[col] = 'Navy';
                else if (wingVal.toUpperCase() === 'AIR') cleanRow[col] = 'Air Force';
                else cleanRow[col] = wingVal;
              } else if ((col === 'certificate' || col === 'certificate_level') && typeof row[col] === 'string') {
                const certVal = row[col].trim();
                if (certVal.toUpperCase() === 'ALL' || certVal.toUpperCase() === 'COMMON' || certVal.toUpperCase() === 'ABC') cleanRow[col] = 'Common';
                else cleanRow[col] = certVal;
              } else {
                cleanRow[col] = row[col];
              }
            }
          });
          return cleanRow;
        });

        const { error: upsertError } = await supabase
          .from(tableType)
          .upsert(chunk, { onConflict: conflictKey });

        if (upsertError) throw upsertError;
        totalInserted += chunk.length;
      }

      setImportResult({ imported: totalInserted, updated: 0, skipped: 0 });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Import failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setError('');
    setValidationResult(null);
    setImportResult(null);
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-navy-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-scaleIn max-h-[90vh] flex flex-col">
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50 flex-shrink-0">
          <h3 className="font-bold text-navy-900 text-lg flex items-center gap-2">
            <Upload className="w-5 h-5 text-gold-500" />
            Upload {tableType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </h3>
          <button onClick={handleClose} className="p-2 hover:bg-surface-200 rounded-lg transition-colors cursor-pointer">
            <X className="w-5 h-5 text-surface-500" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 md:p-6 space-y-4">
          {!importResult ? (
            <>
              <div className="border-2 border-dashed border-surface-300 rounded-xl p-8 text-center hover:border-gold-500 transition-colors cursor-pointer relative">
                <input 
                  type="file" 
                  accept=".csv,.xlsx" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-12 h-12 text-surface-400 mx-auto mb-3" />
                <p className="text-navy-900 font-bold mb-1">
                  {file ? file.name : "Click or drag file to upload"}
                </p>
                <p className="text-surface-500 text-sm">Supports .CSV and .XLSX</p>
              </div>

              {error && (
                <div className="p-3 bg-danger/10 text-danger rounded-lg flex items-start gap-2 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p>{error}</p>
                </div>
              )}

              {validationResult && (
                <div className={`p-4 rounded-xl border ${validationResult.valid ? 'bg-mgreen-50 border-mgreen-200' : 'bg-danger/10 border-danger/20'}`}>
                  <h4 className={`font-bold flex items-center gap-2 mb-2 ${validationResult.valid ? 'text-mgreen-700' : 'text-danger'}`}>
                    {validationResult.valid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {validationResult.valid ? 'Ready to Import' : 'Validation Failed'}
                  </h4>
                  <p className="text-sm mb-2 font-medium">Rows found: {validationResult.data?.length || 0}</p>
                  
                  {validationResult.errors.length > 0 && (
                    <div className="text-sm text-danger space-y-1 max-h-32 overflow-y-auto">
                      {validationResult.errors.map((err, i) => (
                        <p key={i}>• {err}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-mgreen-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-mgreen-600" />
              </div>
              <h3 className="text-xl font-bold text-navy-900 mb-2">Import Successful</h3>
              <div className="flex justify-center gap-6 mt-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-mgreen-600">{importResult.imported}</p>
                  <p className="text-xs text-surface-500 font-medium uppercase">Imported</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gold-600">{importResult.updated}</p>
                  <p className="text-xs text-surface-500 font-medium uppercase">Updated</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-surface-400">{importResult.skipped}</p>
                  <p className="text-xs text-surface-500 font-medium uppercase">Skipped</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-surface-100 flex gap-3 bg-surface-50 flex-shrink-0">
          {!importResult ? (
            <>
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 border border-surface-200 text-surface-700 font-bold rounded-xl hover:bg-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!validationResult?.valid || loading}
                className="flex-1 px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Importing...' : 'Import Data'}
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full px-4 py-2 bg-navy-600 text-white font-bold rounded-xl hover:bg-navy-700 transition-colors cursor-pointer"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
