import Papa from 'papaparse';

export const parseFile = async (file) => {
  return new Promise((resolve, reject) => {
    const extension = file.name.split('.').pop().toLowerCase();

    if (extension === 'csv') {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length) {
            reject(new Error(`CSV Parsing Error: ${results.errors[0].message}`));
          } else {
            resolve(results.data);
          }
        },
        error: (error) => reject(error),
      });
    } else if (extension === 'xlsx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const json = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
          resolve(json);
        } catch (error) {
          reject(new Error('Failed to parse XLSX file'));
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    } else {
      reject(new Error('Unsupported file format. Please upload .csv or .xlsx files.'));
    }
  });
};

export const validateData = (data, type) => {
  const errors = [];
  const warnings = [];

  if (!data || data.length === 0) {
    errors.push('File is empty or could not be parsed.');
    return { valid: false, errors, warnings };
  }

  // Common validation depending on type
  if (type === 'csv_questions') {
    const seenIds = new Set();
    data.forEach((row, i) => {
      if (!row.question_id) errors.push(`Row ${i + 1}: Missing question_id`);
      else {
        if (seenIds.has(row.question_id)) errors.push(`Row ${i + 1}: Duplicate question_id ${row.question_id}`);
        seenIds.add(row.question_id);
      }
      if (!row.subject_code) errors.push(`Row ${i + 1}: Missing subject_code`);
      if (!row.question_text) errors.push(`Row ${i + 1}: Missing question_text`);
      if (row.difficulty && !['1', '2', '3'].includes(String(row.difficulty))) {
        errors.push(`Row ${i + 1}: Invalid difficulty '${row.difficulty}'. Must be 1, 2, or 3.`);
      }
    });
  } else if (type === 'csv_mock_exams') {
    const seenIds = new Set();
    data.forEach((row, i) => {
      if (!row.test_id) errors.push(`Row ${i + 1}: Missing test_id`);
      else {
        if (seenIds.has(row.test_id)) errors.push(`Row ${i + 1}: Duplicate test_id ${row.test_id}`);
        seenIds.add(row.test_id);
      }
      if (!row.question_distribution) errors.push(`Row ${i + 1}: Missing question_distribution`);
    });
  }
  // Other validations can be added as needed

  return { valid: errors.length === 0, errors, warnings };
};
