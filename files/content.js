(() => {
  // 1. Find the main financials container
  const finSection = document.querySelector('section.finContainer');
  if (!finSection) return { success: false, message: "Could not find the financial statement section." };

  // 2. Extract header row
  const headerRow = finSection.querySelector('.tableHeader .row');
  if (!headerRow) return { success: false, message: "Could not find the header row." };

  const headerCells = Array.from(headerRow.querySelectorAll('.column'));
  const header = headerCells.map(cell => cell.textContent.trim().replace(/\s+/g, ' '));

  // 3. Extract data rows
  const bodyRows = Array.from(finSection.querySelectorAll('.tableBody .row'));
  if (!bodyRows.length) return { success: false, message: "No data rows found in the financial statement." };

  const data = bodyRows.map(row => {
    const labelDiv = row.querySelector('.column.sticky .rowTitle') ||
      row.querySelector('.column.sticky');
    const label = labelDiv ? labelDiv.textContent.trim().replace(/\s+/g, ' ') : '';
    const valueCells = Array.from(row.querySelectorAll('.column:not(.sticky)'));
    const values = valueCells.map(cell => cell.textContent.trim().replace(/\s+/g, ' '));
    return [label, ...values];
  });

  const table = [header, ...data];
  const tsv = table.map(row => row.join('\t')).join('\n');
  return { success: true, data: tsv };
})();