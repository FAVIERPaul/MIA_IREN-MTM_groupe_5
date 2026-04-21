// Test simple pour vérifier que gameManager fonctionne
import { gameManager } from "./gameCleanup.js";

console.log("gameManager:", gameManager);
console.log("gameManager.isRunning avant startGame:", gameManager.isRunning);
gameManager.startGame();
console.log("gameManager.isRunning après startGame:", gameManager.isRunning);
gameManager.cleanup();
console.log("gameManager.isRunning après cleanup:", gameManager.isRunning);
