import { createMemoryGame } from "../gameInterface.js";

export function startGame7(container, onFinish) {
  const pairs = [
    { id: "sun", pair: "rain" },
    { id: "fire", pair: "snowflake" },
    { id: "diet", pair: "fast-food" },
    { id: "sleep", pair: "wake-up" },
    { id: "running", pair: "walking" },
    { id: "keep-quiet", pair: "noise" },
    { id: "skiing", pair: "summer" },
    { id: "holidays", pair: "working" },
  ];

  createMemoryGame(container, onFinish, pairs);
}