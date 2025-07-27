/* MemoryGame_Tile.js
 * Child LWC for a single memory game card. Displays a Font Awesome icon on the front and a blank back.
 * Handles click events to flip the card and communicates with parent via custom events.
 */

import { api, LightningElement } from "lwc";

export default class MemoryGame_Tile extends LightningElement {
  @api card; // Card data (id, iconClass, type)
  @api isFlipped = false; // Tracks if card is flipped (shows front)
  @api isDisabled = false; // Prevents clicks when disabled

  /* Mark card as matched or unmatched, updating visual state
   * @param {boolean} isMatched - True if card is part of a matched pair
   */
  @api isMatched(isMatched) {
    const cardFront = this.template.querySelector(".card-front");
    if (isMatched) {
      cardFront.classList.add("card-front-matched"); // Sets the background color to green
    } else {
      if (cardFront.classList.contains("card-front-matched")) {
        cardFront.classList.remove("card-front-matched");
      }
    }
  }

  /* Handle card clicks, dispatching flip event if allowed */
  handleCardClick() {
    if (this.isDisabled) {
      return;
    }
    if (!this.isFlipped) {
      this.dispatchFlipped();
    }
  }

  /* Compute CSS class for flip animation */
  get cardClass() {
    return this.isFlipped ? "card-inner flipped" : "card-inner";
  }

  /* Dispatch flipped event to parent with card details */
  dispatchFlipped() {
    const flippedEvent = new CustomEvent("flipped", {
      bubbles: true,
      detail: { id: this.card.id, type: this.card.type }
    });
    this.dispatchEvent(flippedEvent);
  }
}
