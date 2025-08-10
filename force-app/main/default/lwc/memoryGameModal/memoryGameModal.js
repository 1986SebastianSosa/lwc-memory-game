/* MemoryGameModal.js
 * Modal component to display game win message with moves and time.
 * Extends LightningModal to show a centered popup with an OK button.
 */

import { api } from "lwc";
import LightningModal from "lightning/modal";

export default class MemoryGameModal extends LightningModal {
  // Accepts the moves and timer values from parent component
  @api moves;
  @api timer;

  /* Close modal and return 'ok' result to parent */
  handleCloseModal() {
    this.close("ok");
  }
}
