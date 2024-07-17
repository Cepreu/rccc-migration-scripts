import { Rule } from "./RuleEngine.mjs";
import { Legacy } from "./LegacyCatalog.mjs";
import { OVERAGE, RECURRING } from "./Rules.mjs";

//////////////////
class FixActiveStorage extends Rule {
  static {
    super.Register("Fix Active Storage");
  }
  action(acct) {
    let choosenActiveStorageSKU;
    const overActiveStorage = acct.ents.filter(
      (e) =>
        Legacy.IsActiveStorage(e.EXT_PRODUCT_ID) && e.ProductFamily === OVERAGE
    );
    const recActiveStorage = acct.ents.find(
      (e) =>
        Legacy.IsActiveStorage(e.EXT_PRODUCT_ID) &&
        e.ProductFamily === RECURRING
    );
    const nicActiveStorage = acct.nics.find((n) =>
      Legacy.IsActiveStorage(n.SKU)
    );
    const c2cActiveStorage = acct.cases.find((c) =>
      Legacy.IsActiveStorage(c.skuid)
    );

    if (
      nicActiveStorage &&
      recActiveStorage &&
      nicActiveStorage.SKU !== recActiveStorage.EXT_PRODUCT_ID
    ) {
      choosenActiveStorageSKU = nicActiveStorage.SKU;
      //replace ents & cases
      acct.ents = acct.ents.filter(
        (e) => !Legacy.IsActiveStorage(e.EXT_PRODUCT_ID)
      );
      acct.icb_ents = acct.icb_ents.filter(
        (e) => !Legacy.IsActiveStorage(e.EXT_PRODUCT_ID)
      );

      Rule.AddEntitlement({
        acct,
        sku: choosenActiveStorageSKU,
        qtty: recActiveStorage.QNTY_THRESHOLD,
        productFamily: RECURRING,
        correctICB: true,
      });

      Rule.AddEntitlement({
        acct,
        sku: choosenActiveStorageSKU,
        qtty: recActiveStorage.QNTY_THRESHOLD,
        productFamily: OVERAGE,
        correctICB: true,
      });

      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: nicActiveStorage.SKU,
        qtty: recActiveStorage.QNTY_THRESHOLD,
      });
      acct.logWarning(
        this.name,
        `${nicActiveStorage.SKU} was added to ents and case2case to match RCMRC`
      );
    } else if (
      nicActiveStorage &&
      (!c2cActiveStorage || nicActiveStorage.SKU !== c2cActiveStorage.skuid)
    ) {
      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: nicActiveStorage.SKU,
        qtty: recActiveStorage ? recActiveStorage.QNTY_THRESHOLD : 0,
      });

      acct.logWarning(
        this.name,
        `${nicActiveStorage.SKU} was added to case2case to match RCMRC`
      );
    } else if (
      recActiveStorage &&
      (!c2cActiveStorage ||
        c2cActiveStorage.skuid !== recActiveStorage.EXT_PRODUCT_ID)
    ) {
      choosenActiveStorageSKU = recActiveStorage.EXT_PRODUCT_ID;
      acct.cases = acct.cases.filter(
        (c2c) => !Legacy.IsActiveStorage(c2c.skuid)
      );
      Rule.AddCase({
        account: acct,
        skuid: recActiveStorage.EXT_PRODUCT_ID,
        qtty: recActiveStorage.QNTY_THRESHOLD,
      });
      acct.logWarning(
        this.name,
        `${recActiveStorage.EXT_PRODUCT_ID} "${recActiveStorage.ITEM_NAME}" was added to case2case to match Entitlements`
      );
    }
    return true;
  }
}
