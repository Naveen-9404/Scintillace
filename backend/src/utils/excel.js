import XLSX from "xlsx";

/**
 * ============================================================
 * Convert Records To Excel Workbook
 * ============================================================
 *
 * @param {Array} records
 * @param {Object} options
 * @returns {Buffer}
 */

const createExcelWorkbook = (
  records = [],
  {
    sheetName = "Data",
  } = {},
) => {
  if (!Array.isArray(records)) {
    throw new TypeError(
      "Records must be an array.",
    );
  }

  const normalizedRecords =
    records.map((record) => {
      if (
        record &&
        typeof record.toObject ===
          "function"
      ) {
        return record.toObject({
          virtuals: true,
        });
      }

      return record;
    });

  const workbook =
    XLSX.utils.book_new();

  const worksheet =
    XLSX.utils.json_to_sheet(
      normalizedRecords,
    );

  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    sheetName.substring(0, 31),
  );

  return XLSX.write(
    workbook,
    {
      type: "buffer",
      bookType: "xlsx",
    },
  );
};

/**
 * ============================================================
 * Convert Multiple Sheets To Excel
 * ============================================================
 */

const createMultiSheetWorkbook = (
  sheets = [],
) => {
  if (!Array.isArray(sheets)) {
    throw new TypeError(
      "Sheets must be an array.",
    );
  }

  const workbook =
    XLSX.utils.book_new();

  sheets.forEach(
    ({
      name,
      data = [],
    }) => {
      const normalizedData =
        data.map((record) => {
          if (
            record &&
            typeof record.toObject ===
              "function"
          ) {
            return record.toObject({
              virtuals: true,
            });
          }

          return record;
        });

      const worksheet =
        XLSX.utils.json_to_sheet(
          normalizedData,
        );

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        String(name || "Data").substring(
          0,
          31,
        ),
      );
    },
  );

  return XLSX.write(
    workbook,
    {
      type: "buffer",
      bookType: "xlsx",
    },
  );
};

/**
 * ============================================================
 * Export
 * ============================================================
 */

export {
  createExcelWorkbook,
  createMultiSheetWorkbook,
};