Boolean doWeNeedToBlockOppCreation = false;
List<String> inputAccEnterpriseIds = new List<String> {'list', 'of', 'Enterprise', 'Account', 'ids', 'goes', 'here'};

// leave only unique Ids
Set<String> accEnterpriseIds = new Set<String>(inputAccEnterpriseIds);

// get Account Ids based on Enterprise Account Id
Set<Id> accIds = new Map<Id, Account>(
        (List<Account>) new AccountSelector()
                .newQueryFactory()
                .selectField(Account.Id)
                .setCondition('RC_User_ID__c IN :bind0')
                .setQueryBindings(new List<Object> {accEnterpriseIds})
                .executeQuery()
    ).keySet();

String newMigrationStatus = doWeNeedToBlockOppCreation
                            ? AccountHelper.ACCOUNT_MIGRATION_TYPE_SCHEDULED_BLOCKED
                            : AccountHelper.ACCOUNT_MIGRATION_TYPE_SCHEDULED;

List<Account> accountsToUpdate = new List<Account>();
for (Id accId : accIds) {
    accountsToUpdate.add(new Account(Id = accId, AccMigrationFlag__c = newMigrationStatus));
}

if (!accountsToUpdate.isEmpty()) {
    Triggers.switchOff();
    update accountsToUpdate;
    Triggers.switchOn();
}