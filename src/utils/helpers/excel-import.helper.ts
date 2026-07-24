import axios from "axios";
import ExcelJS from "exceljs";

interface ExcelData {
  header: string;
  key: string;
  width: number;
}

async function fetchExcelDataFromSignedUrl(url: string, columns: ExcelData[]) {
  try {
    // Fetch file
    const response = await axios.get<ArrayBuffer>(url, {
      responseType: "arraybuffer",
    });

    // Load workbook
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(response.data);

    // Get first worksheet
    const worksheet = workbook.worksheets[0];

    const keys = columns.map((col) => col.key);

    const jsonData: Record<string, any>[] = [];

    // Skip header row (row 1), start from row 2
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      if (row.actualCellCount === 0) return;

      const rowData: Record<string, any> = {};

      keys.forEach((key, index) => {
        const cell = row.getCell(index + 1);
        rowData[key] = cell.value ?? "";
      });

      jsonData.push(rowData);
    });

    return jsonData;
  } catch (error) {
    console.error("Error fetching or parsing Excel file:", error);
    throw error;
  }
}

export { fetchExcelDataFromSignedUrl };
