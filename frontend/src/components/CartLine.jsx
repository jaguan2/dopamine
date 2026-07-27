import { useState } from "react";
import { useCart } from "../contexts/CartContext.jsx";
import { fmt } from "../lib/money.js";

// One cart row: name, line total, quantity stepper and an optional note
// that rides along to the kitchen as this item's special instructions.
export default function CartLine({ line }) {
  const { setQty, setInstructions } = useCart();
  const [noteOpen, setNoteOpen] = useState(Boolean(line.instructions));

  return (
    <li className="cart-line">
      <div className="cart-line-info">
        <span className="cart-line-name">
          {line.item_name}
          {line.price_label && (
            <span className="plabel"> ({line.price_label})</span>
          )}
        </span>
        <span className="cart-line-price">
          {fmt(line.unit_price_cents * line.quantity)}
        </span>
      </div>

      <div className="cart-line-controls">
        <div className="qty-stepper">
          <button
            type="button"
            onClick={() => setQty(line.price_option_id, line.quantity - 1)}
            aria-label={`Remove one ${line.item_name}`}
          >
            −
          </button>
          <span>{line.quantity}</span>
          <button
            type="button"
            onClick={() => setQty(line.price_option_id, line.quantity + 1)}
            aria-label={`Add one ${line.item_name}`}
          >
            +
          </button>
        </div>
        {!noteOpen && (
          <button
            type="button"
            className="note-toggle"
            onClick={() => setNoteOpen(true)}
          >
            + Add note
          </button>
        )}
      </div>

      {noteOpen && (
        <input
          className="line-note"
          type="text"
          maxLength={300}
          value={line.instructions || ""}
          placeholder="e.g. no scallions, sauce on the side"
          aria-label={`Special instructions for ${line.item_name}`}
          onChange={(e) => setInstructions(line.price_option_id, e.target.value)}
          onBlur={() => { if (!line.instructions) setNoteOpen(false); }}
        />
      )}
    </li>
  );
}
