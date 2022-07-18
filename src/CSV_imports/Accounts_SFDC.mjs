import configuration from "../../configuration.mjs";
import { csv2sql } from "../utils/csv2sql.mjs";

export const importAccountReport = () => {
  const fields = [
    { field: "InContact BU ID", dbcolumn: "InContactBUID", type: "INTEGER" },
    {
      field: "Enterprise Account ID",
      dbcolumn: "EnterpriseAccountID",
      type: "INTEGER",
      pkey: true,
    },
    { field: "Billing ID", dbcolumn: "BillingID", type: "INTEGER" },
    { field: "Account ID", dbcolumn: "AccountID" },
    { field: "Account Name", dbcolumn: "AccountName" },
    { field: "Service name", dbcolumn: "Servicename" },
    { field: "Account Payment Method", dbcolumn: "AccountPaymentMethod" },
    { field: "Payment Plan", dbcolumn: "PaymentPlan" },
    { field: "Brand", dbcolumn: "Brand" },
    { field: "inContact Cluster", dbcolumn: "inContactCluster" },
    {
      field: "Contact Center Numbers Location",
      dbcolumn: "ContactCenterNumbersLocation",
    },
    { field: "Agent leg SIP config", dbcolumn: "AgentlegSIPconfig" },
    { field: "Outbound Transport", dbcolumn: "OutboundTransport" },
    {
      field: "Implementation Complete Date",
      dbcolumn: "ImplementationCompleteDate",
    },
    { field: "Provision Date", dbcolumn: "ProvisionDate" },
    { field: "Bill As-Of Date", dbcolumn: "BillAsOfDate" },
    { field: "Implementation Contact", dbcolumn: "ImplementationContact" },
    {
      field: "No. of InContact Seats",
      dbcolumn: '"No.ofInContactSeats"',
      type: "INTEGER",
    },
    { field: "Current Owner", dbcolumn: "CurrentOwner" },
    { field: "Current Owner Email", dbcolumn: "CurrentOwnerEmail" },
    {
      field: "Current Owner Manager Email",
      dbcolumn: "CurrentOwnerManagerEmail",
    },
    { field: "CSM", dbcolumn: "CSM" },
    { field: "InContact Service", dbcolumn: "InContactService" },
    { field: "Price per Seat Currency", dbcolumn: "PriceperSeatCurrency" },
    { field: "Price per Seat", dbcolumn: "PriceperSeat", type: "NUMERIC" },
    {
      field: "Contact Center MRR Currency",
      dbcolumn: "ContactCenterMRRCurrency",
    },
    {
      field: "Contact Center MRR",
      dbcolumn: "ContactCenterMRR",
      type: "NUMERIC",
    },
    {
      field: "Current Total MRR (converted) Currency",
      dbcolumn: "CurrentTotalMRRconvertedCurrency",
    },
    {
      field: "Current Total MRR (converted)",
      dbcolumn: "CurrentTotalMRRconverted",
      type: "NUMERIC",
    },
  ];
  //const guardFunc = (row) => row["IC Case Number"] !== "";
  csv2sql(
    "accounts_sfdc",
    fields,
    configuration.SFDC_ACCOUNTS /*, ",", guardFunc*/
  );
};
