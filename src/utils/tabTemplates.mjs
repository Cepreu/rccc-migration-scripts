const defaultDataStyle = {
  font: {
    color: "#47180E",
  },
  alignment: {
    wrapText: false,
    horizontal: "left",
  },
};

export function SummaryTempl(workbook) {
  const batchName = "BATCH 1 - CC PRODUCTION MIGRATION";
  const ws = workbook.addWorksheet("Summary");

  ws.cell(1, 1).string(batchName).style(defaultDataStyle);
  ws.cell(2, 1)
    .string("PRE Vs Post Migration Analysis")
    .style(defaultDataStyle);
  ws.cell(3, 1).string("Migration Date").style(defaultDataStyle);
  ws.cell(3, 2).string("1/1/2023").style(defaultDataStyle);
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
}
