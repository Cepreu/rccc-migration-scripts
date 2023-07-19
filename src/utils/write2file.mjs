import path from "path";
import fs1 from "fs-extra";
import excel from "excel4node";
import configuration from "../../configuration.mjs";
//import { SummaryTempl } from "../utils/tabTemplates.mjs";

const defaultHeaderStyle = {
  font: {
    color: "#EA3A14",
    //    size: 12,
    bold: true,
  },
};
const defaultDataStyle = {
  font: {
    color: "#47180E",
  },
  alignment: {
    wrapText: false,
    horizontal: "left",
  },
};

const getDir = (pathArr) => {
  console.log(pathArr);
  console.log(configuration.OUTPUTPATH);
  const dir = path.resolve(
    configuration.OUTPUTPATH ? configuration.OUTPUTPATH : process.cwd(),
    ...pathArr
  );
  fs1.ensureDirSync(dir);
  fs1.emptyDirSync(dir);
  return dir;
};

export class Export2Excel {
  constructor(tabsDescrArr, pathArr, fileName) {
    const dir = getDir(pathArr);
    this.fileName = path.resolve(dir, `${fileName}.xlsx`);
    this.workbook = new excel.Workbook();
    //   SummaryTempl(this.workbook);

    this.styleForData = this.workbook.createStyle(defaultDataStyle);
    this.tabs = tabsDescrArr.map((t) => {
      const theTab = {
        name: t.tab,
        worksheet: this.workbook.addWorksheet(t.tab),
        columns: t.columns,
        cursor: t.gap || 1,
      };
      const styleForHeaders = this.workbook.createStyle(defaultHeaderStyle);
      this.#addExcelSheetHeader(theTab, styleForHeaders);
      return theTab;
    });
  }

  appendData(tabsDataArr) {
    tabsDataArr.forEach((tab) => {
      if (tab.data.length > 0) {
        const t = this.tabs.find((tt) => tab.tab == tt.name);
        this.#populateExcelSheet(tab.data, t);
      }
    });
  }

  close() {
    this.workbook.write(this.fileName);
  }

  #addExcelSheetHeader(tab, style) {
    let excl_col = 1;

    tab.columns.forEach((col) => {
      tab.worksheet.column(excl_col).setWidth(col.length + 2);
      tab.worksheet.cell(tab.cursor, excl_col++).string(col).style(style);
    });

    tab.cursor++;
  }

  #setWidths(array, ws) {
    ws.columns.forEach((col, ind) => {
      const lengthArr = array.map(
        (row) => (row[col] != null ? (row[col] + "").length : 0) + 2
      );
      const maxWidth = Math.max(
        ...lengthArr,
        ws.worksheet.column(ind + 1).width
      );
      ws.worksheet.column(ind + 1).setWidth(maxWidth);
    });
  }

  #populateExcelSheet(array, ws) {
    this.#setWidths(array, ws);

    array.forEach((data_row) => {
      let excl_row = ws.cursor;
      let excl_col = 1;
      ws.columns.forEach((c) => {
        const element = data_row[c];
        switch (typeof element) {
          case "string":
            ws.worksheet
              .cell(excl_row, excl_col++)
              .string(element)
              .style(this.styleForData);
            break;
          case "number":
            if (isNaN(element)) {
              ws.worksheet
                .cell(excl_row, excl_col++)
                .string("NaN")
                .style(this.styleForData);
            } else {
              ws.worksheet
                .cell(excl_row, excl_col++)
                .number(element)
                .style(this.styleForData);
            }
            break;
          case "boolean":
            ws.worksheet
              .cell(excl_row, excl_col++)
              .string(element.toString())
              .style(this.styleForData);
            break;
          default:
            ws.worksheet
              .cell(excl_row, excl_col++)
              .string("")
              .style(this.styleForData);
            break;
        }
      });
      ws.cursor++;
    });
  }
}

// Helper func for single-step exports
export function write2excel(excelDataAll, pathArr, fileName) {
  excelDataAll.forEach((tab) => {
    if (!tab.hasOwnProperty("columns")) {
      tab.columns = tab.data.length > 0 ? Object.keys(tab.data[0]) : ["dummy"];
    }
  });
  const theExcel = new Export2Excel(excelDataAll, pathArr, fileName);
  theExcel.appendData(excelDataAll);
  theExcel.close();
}
