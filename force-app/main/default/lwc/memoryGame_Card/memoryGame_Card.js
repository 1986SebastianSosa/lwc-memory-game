/* MemoryGame_Card.js
 * Parent LWC for a 4x4 memory game with 16 cards. Manages game state (cards, moves, timer),
 * shuffles cards, handles card flips, and displays a win modal when all pairs are matched.
 * Uses Font Awesome for icons and LightningModal for win notification.
 */

/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, wire } from "lwc";
import { loadStyle } from "lightning/platformResourceLoader";
import FONT_AWESOME from "@salesforce/resourceUrl/fontawesome";
import MemoryGameModal from "c/memoryGameModal";
import saveMemoryGame from "@salesforce/apex/MemoryGameResultController.saveMemoryGame";
import userId from "@salesforce/user/Id";
import MEMORY_GAME_MESSAGE_CHANNEL from "@salesforce/messageChannel/memoryGame__c";
import { publish, MessageContext } from "lightning/messageService";

export default class MemoryGame_Card extends LightningElement {
  // State variables for game logic
  isLibraryLoaded = false; // Tracks if Font Awesome is loaded
  isTimerStated = false; // Tracks if timer is running
  moves = 0; // Counts player moves
  seconds = 0; // Tracks elapsed time
  cards; // Holds the shuffled cards array
  cardsFlipped = []; // Stores currently flipped cards
  cardsMatched = []; // Stores matched card pairs
  interval; // Timer interval
  timer; // Formatted timer string (HH:MM:SS)
  @wire(MessageContext)
  context;

  // Initial card data with 8 icon pairs for matching
  unshuffledCards = [
    {
      id: 1,
      iconClass: "fa fa-bug fa-2x",
      type: "bug",
    },
    {
      id: 2,
      iconClass: "fa fa-binoculars fa-2x",
      type: "binoculars",
    },
    {
      id: 3,
      iconClass: "fa fa-birthday-cake fa-2x",
      type: "birthday-cake",
    },
    {
      id: 4,
      iconClass: "fa fa-calculator fa-2x",
      type: "calculator",
    },
    {
      id: 5,
      iconClass: "fa fa-flask fa-2x",
      type: "flask",
    },
    {
      id: 6,
      iconClass: "fa fa-hourglass-end fa-2x",
      type: "hourglass",
    },
    {
      id: 7,
      iconClass: "fa fa-heart fa-2x",
      type: "heart",
    },
    {
      id: 8,
      iconClass: "fa fa-eye fa-2x",
      type: "eye",
    },
    {
      id: 9,
      iconClass: "fa fa-bug fa-2x",
      type: "bug",
    },
    {
      id: 10,
      iconClass: "fa fa-binoculars fa-2x",
      type: "binoculars",
    },
    {
      id: 11,
      iconClass: "fa fa-birthday-cake fa-2x",
      type: "birthday-cake",
    },
    {
      id: 12,
      iconClass: "fa fa-calculator fa-2x",
      type: "calculator",
    },
    {
      id: 13,
      iconClass: "fa fa-flask fa-2x",
      type: "flask",
    },
    {
      id: 14,
      iconClass: "fa fa-hourglass-end fa-2x",
      type: "hourglass",
    },
    {
      id: 15,
      iconClass: "fa fa-heart fa-2x",
      type: "heart",
    },
    {
      id: 16,
      iconClass: "fa fa-eye fa-2x",
      type: "eye",
    },
  ];

  /* Initialize shuffled cards and timer on component load */
  connectedCallback() {
    this.cards = this.shuffleCards(this.unshuffledCards);
    // this.cards = this.unshuffledCards;
    this.setTimer();
  }

  /* Load Font Awesome CSS once after render */
  renderedCallback() {
    if (this.isLibraryLoaded) {
      return;
    }
    loadStyle(
      this,
      FONT_AWESOME + "/fontawesome/css/font-awesome.min.css"
    ).then(() => {
      this.isLibraryLoaded = true;
    });
  }

  /* Handle card flip events from child components
   * @param {CustomEvent} e - Event with card id and type
   */
  async handleFlipped(e) {
    if (!this.isTimerStarted) {
      this.startTimer();
      this.isTimerStated = true;
    }
    const { id, type } = e.detail;
    this.updateCardState(id, true); // Flips the card
    this.cardsFlipped.push({ id, type });
    if (this.cardsFlipped.length === 2) {
      const allCardsComponents =
        this.template.querySelectorAll("c-memory-game-tile");
      allCardsComponents.forEach((card) => {
        card.isDisabled = true; // Disable all cards during comparison
      });
      this.increaseMoves();
      if (this.cardsFlipped[0].type === this.cardsFlipped[1].type) {
        // Matching pair found
        for (const card of this.cardsFlipped) {
          this.cardsMatched.push(card);
          if (this.cardsMatched.length === 16) {
            try {
              // Saves the result to a Memory_Game_Result__c record
              await saveMemoryGame({
                seconds: this.seconds,
                moves: this.moves,
                player: userId,
              });
              // Mesagges the results table component to update the data
              this.updateResultsTable();
            } catch (error) {
              console.log(error);
            }

            // All cards are matched. Game won
            setTimeout(() => {
              this.openWinModal();
            }, 2000);
          }
        }
        setTimeout(() => {
          allCardsComponents.forEach((card) => {
            if (
              !this.cardsMatched.find(
                (matchedCard) => matchedCard.id === card.card.id
              )
            ) {
              card.isDisabled = false;
            } else {
              card.isMatched(true);
            }
          });
          this.cardsFlipped = [];
        }, 1000);
      } else {
        // Cards didn't match
        setTimeout(() => {
          for (const card of this.cardsFlipped) {
            // Flip back cards
            this.updateCardState(card.id, false);
          }
          allCardsComponents.forEach((card) => {
            // Re enable non-matching cards
            card.isDisabled = false;
          });
          this.cardsFlipped = [];
        }, 1000);
      }
    }
  }

  // Adds a move
  increaseMoves() {
    this.moves++;
  }

  // Flips cards
  updateCardState(id, isFlipped) {
    const allCardsComponents =
      this.template.querySelectorAll("c-memory-game-tile");
    allCardsComponents.forEach((item) => {
      if (item.card.id === id) {
        item.isFlipped = isFlipped;
      }
    });
  }

  // Shuffles cards
  shuffleCards(array) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // Resets all state variables, re enables cards and flips them face down
  resetGame() {
    this.moves = 0;
    this.seconds = 0;
    this.stopTimer();

    this.setTimer();
    this.cardsFlipped = [];
    this.cardsMatched = [];
    const cards = this.template.querySelectorAll("c-memory-game-tile");
    cards.forEach((card) => {
      card.isFlipped = false;
      card.isDisabled = false;
      card.isMatched(false);
    });
    this.shuffleCards(this.unshuffledCards);
  }

  // Formats the timer to be printed
  setTimer() {
    const hours = Math.floor(this.seconds / 3600);
    const minutes = Math.floor((this.seconds % 3600) / 60);
    const seconds = Math.floor(this.seconds % 60);
    this.timer = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }

  // Adds a second and updates the timer
  addSecond() {
    this.seconds++;
    this.setTimer();
  }
  // Starts the timer
  startTimer() {
    if (!this.interval) {
      this.interval = setInterval(() => this.addSecond(), 1000);
    }
  }

  // Stops the timer
  stopTimer() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.isTimerStated = false;
    }
  }
  /* Open win modal when all 16 cards are matched */
  async openWinModal() {
    const result = await MemoryGameModal.open({
      label: "Game Won",
      moves: this.moves,
      timer: this.timer,
      size: "small",
    });
    if (result === "ok") {
      this.handleCloseModal();
    }
  }
  /* Reset game state when modal closes or reset button is clicked */
  handleCloseModal() {
    this.resetGame();
  }

  updateResultsTable() {
    publish(this.context, MEMORY_GAME_MESSAGE_CHANNEL, {
      isGameCompleted: true,
    });
  }
}
