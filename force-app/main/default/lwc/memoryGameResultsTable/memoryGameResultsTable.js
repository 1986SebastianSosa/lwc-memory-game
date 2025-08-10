import { LightningElement, track, wire } from "lwc";
import getMemoryGameResults from "@salesforce/apex/MemoryGameResultController.getMemoryGameResults";
import MEMORY_GAME_MESSAGE_CHANNEL from "@salesforce/messageChannel/memoryGame__c";
import { subscribe, MessageContext } from "lightning/messageService";

// Define the columns for the lightning-datatable component
const columns = [
  { label: "Player", fieldName: "Player" },
  { label: "Time", fieldName: "Time__c" },
  { label: "Moves", fieldName: "Moves__c" },
  { label: "Date", fieldName: "Completed_on__c" }
];

export default class MemoryGameResultsTable extends LightningElement {
  @track games = []; // Reactive tracked array to hold the formatted game results for display in the datatable
  columns = columns; // Non-reactive property to store the datatable columns
  @wire(MessageContext) // Wire the MessageContext to enable LMS publishing/subscribing in this component
  context;

  // Lifecycle hook called when the component is inserted into the DOM
  connectedCallback() {
    this.getResults(); // Fetch initial game results on component load
    this.subscribeToGameResultsMessageChannel(); // Set up subscription to the message channel for real-time updates
  }

  // Method to subscribe to the Lightning Message Channel for game completion notifications
  subscribeToGameResultsMessageChannel() {
    subscribe(this.context, MEMORY_GAME_MESSAGE_CHANNEL, (msg) => {
      if (msg.isGameCompleted) {
        this.getResults();
      }
    });
  }

  // Asynchronous method to fetch and format game results from Apex
  async getResults() {
    try {
      const response = await getMemoryGameResults();
      const games = await response.map((item) => {
        return {
          ...item,
          Completed_on__c: this.formattedDateTime(item.Completed_on__c), // Format the completion date for readability
          Player: item.Player__r.Name // Extract the player's name from the related User record
        };
      });
      this.games = games;
    } catch (error) {
      console.error(error);
    }
  }

  // Helper method to format a Salesforce DateTime string into a human-readable format
  formattedDateTime(date) {
    const newDate = new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });

    return newDate;
  }
}
