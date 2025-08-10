public with sharing class MemoryGameResultController {
  @AuraEnabled
  public static void saveMemoryGame(Integer seconds, Integer moves, Id player) {
    Memory_Game_Result__c newGame = new Memory_Game_Result__c();
    newGame.Time__c = seconds;
    newGame.Moves__c = moves;
    newGame.Player__c = player;
    newGame.Completed_on__c = Datetime.now();

    System.debug(newGame);

    insert newGame;
  }

  @AuraEnabled(cacheable=false)
  public static List<Memory_Game_Result__c> getMemoryGameResults() {
    try {
      return [
        SELECT Player__r.Name, Time__c, Moves__c, Completed_on__c
        FROM Memory_Game_Result__c
        ORDER BY Time__c ASC
        LIMIT 10
      ];
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}
