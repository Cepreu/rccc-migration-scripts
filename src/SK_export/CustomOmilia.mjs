import { Rule } from "./RuleEngine.mjs";
import { RECURRING } from "./Rules.mjs";

//////////////////
class CustomOmilia extends Rule {
  static {
    super.Register("Changing Omilia to 10x bundles");
  }
  action(acct) {
    const omilia = acct.icb_ents.find(
      (ie) => ie.EXT_PRODUCT_ID == "1510-1612-000" && ie.TYPE_NAME === RECURRING
    );
    if (omilia) {
      omilia.QNTY_THRESHOLD /= 10;
      omilia.RETAIL_PRICE *= 10;
      if (omilia.DISCOUNT_TYPE === "Currency") {
        (omilia.DISCOUNT *= 10), (omilia.DISCOUNT_VALUE *= 10);
      }
    }

    acct.cases = acct.cases.filter(
      (c2c) =>
        !(
          !acct.ents.find((r) => c2c.skuid === r.EXT_PRODUCT_ID) &&
          ((acct.facts.NBU &&
            c2c.qtty === 0 &&
            acct.logInfo(
              this.name,
              `${c2c.skuid} was removed from Vendor Order as obsolete`
            )) ||
            acct.logWarning(
              this.name,
              `${c2c.skuid} was removed from Vendor Order: Qnty: ${c2c.qtty}`
            ))
        )
    );
    return true;
  }
}
