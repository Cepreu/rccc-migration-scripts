////NOT USED

const defaultDataStyle = {
  font: {
    color: "#47180E",
  },
  alignment: {
    wrapText: false,
    horizontal: "left",
  },
};
const headerStyle = {
  font: {
    color: "#47180E",
  },
  alignment: {
    wrapText: false,
    horizontal: "left",
  },
};

export function SummaryTempl(workbook) {
  const ws = workbook.addWorksheet("Summary");

  const batchName = "BATCH 1 - CC PRODUCTION MIGRATION";
  const migrationDate = "01/01/24";

  const approversDesk = () => {
    ws.cell(1, 1).string(batchName).style(defaultDataStyle);
    ws.cell(2, 1)
      .string("PRE Vs Post Migration Analysis")
      .style(defaultDataStyle);
    ws.cell(3, 1).string("Migration Date").style(defaultDataStyle);
    ws.cell(3, 2).string(migrationDate).style(defaultDataStyle);
    ws.cell(3, 3).string("").style(defaultDataStyle);

    ws.cell(4, 1).string("Billing Team").style(defaultDataStyle);
    ws.cell(4, 2).string("Reviewer").style(defaultDataStyle);
    ws.cell(4, 3).string("").style(defaultDataStyle);

    ws.cell(5, 1).string("Report Reviewer 1").style(defaultDataStyle);
    ws.cell(5, 2).string("Review date").style(defaultDataStyle);
    ws.cell(5, 3).string("").style(defaultDataStyle);

    ws.cell(6, 1).string("Revenue Team").style(defaultDataStyle);
    ws.cell(6, 2).string("Reviewer").style(defaultDataStyle);
    ws.cell(6, 3).string("").style(defaultDataStyle);

    ws.cell(7, 1).string("Report Reviewer 2").style(defaultDataStyle);
    ws.cell(7, 2).string("Review date").style(defaultDataStyle);
    ws.cell(7, 3).string("").style(defaultDataStyle);
  };

  const testStatDesk = () => {
    ws.cell(11, 3).string(batchName).style(defaultDataStyle);
    const testStat = [
      "Service billing date",
      "Plan billing date",
      "Package Name",
      "Plan duration",
      "Payment method",
      "Billing address",
      "Time zone",
      "Credit limit",
      "MRS",
    ].map((f, ind) => {
      return {
        "#": ind + 1,
        "#	Field": f,
        "# of Mismatches": 0,
        "% of Mismatch": "0%",
        Result: "Pass",
        Comments: "`All ${f} matched`",
      };
    });
    populateExcelSheet(testStat, ws);
  };

  const batchParamsDesk = () => {
    const batchParameters = [
      { Parameter: "Batch Name", Value: "Batch1" },
      { Parameter: "Batch Description", Value: "Some descr" },
      { Parameter: "Max Seats", Value: 10 },
      { Parameter: "Brand", Value: "RingCentral" },
      { Parameter: "Telco Provider", Value: "RC" },
      { Parameter: "Seat Editions", Value: "Legacy" },
      { Parameter: "Account List", Value: "" },
      { Parameter: "Cases Min", Value: 0 },
      { Parameter: "Cases Max", Value: 1 },
      { Parameter: "NBU Case available", Value: false },
      { Parameter: "Batch Size", Value: 12 },
      { Parameter: "Max ContactCenter MRR", Value: 0 },
      { Parameter: "Max Total MRR", Value: 0 },
    ];
    populateExcelSheet(batchParameters, ws);
  };

  populateExcelSheet = (array, ws) => {
    //    this.#setWidths(array, ws);
    const styleForHeaders = ws.createStyle(defaultHeaderStyle);
    this.styleForData = ws.createStyle(defaultDataStyle);

    array.forEach((data_row) => {
      let excl_row = ws.cursor;
      let excl_col = 1;
      ws.columns.forEach((c) => {
        const element = data_row[c];
        switch (typeof element) {
          case "string":
            ws.cell(excl_row, excl_col++).string(element).style(styleForData);
            break;
          case "number":
            ws.cell(excl_row, excl_col++).number(element).style(styleForData);
            break;
          case "boolean":
            ws.cell(excl_row, excl_col++)
              .string(element.toString())
              .style(styleForData);
            break;
          default:
            ws.cell(excl_row, excl_col++).string("").style(styleForData);
            break;
        }
      });
      ws.cursor++;
    });
  };

  approversDesk();
  testStatDesk();
  batchParamsDesk();
}
