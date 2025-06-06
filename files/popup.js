document.getElementById('scrape').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      // The entire content.js code, but as a function
      // To avoid duplication, you can import the code or keep it in sync
      const finSection = document.querySelector('section.finContainer');
      if (!finSection) return { success: false, message: "Could not find the financial statement section." };
      const headerRow = finSection.querySelector('.tableHeader .row');
      if (!headerRow) return { success: false, message: "Could not find the header row." };
      const headerCells = Array.from(headerRow.querySelectorAll('.column'));
      const header = headerCells.map(cell => cell.textContent.trim().replace(/\s+/g, ' '));
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
    },
  });

  if (result.success) {
    try {
      await navigator.clipboard.writeText(result.data);
      document.getElementById('status').textContent = "Copied! Paste into Excel or Google Sheets.";
    } catch (e) {
      document.getElementById('status').textContent = "Could not copy to clipboard. " + e;
    }
  } else {
    document.getElementById('status').textContent = result.message;
  }
});