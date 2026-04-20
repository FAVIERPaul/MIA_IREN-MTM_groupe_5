// Système simple et robuste de cleanup
export class GameManager {
  constructor() {
    this.isRunning = false;
    this.timers = [];
    this.listeners = [];
    this.frames = [];
  }

  addInterval(timerId) {
    if (timerId !== null && timerId !== undefined) {
      this.timers.push({ type: 'interval', id: timerId });
    }
    return timerId;
  }

  addTimeout(timerId) {
    if (timerId !== null && timerId !== undefined) {
      this.timers.push({ type: 'timeout', id: timerId });
    }
    return timerId;
  }

  addAnimationFrame(frameId) {
    if (frameId !== null && frameId !== undefined) {
      this.frames.push(frameId);
    }
    return frameId;
  }

  addEventListener(target, event, handler) {
    if (!target) return;
    this.listeners.push({ target, event, handler });
    target.addEventListener(event, handler);
  }

  cleanup() {
    this.isRunning = false;

    // Arrêter tous les timers
    this.timers.forEach(({ type, id }) => {
      try {
        if (type === 'interval') {
          clearInterval(id);
        } else if (type === 'timeout') {
          clearTimeout(id);
        }
      } catch (e) {
        // Ignorer les erreurs
      }
    });
    this.timers = [];

    // Arrêter tous les animation frames
    this.frames.forEach(frameId => {
      try {
        cancelAnimationFrame(frameId);
      } catch (e) {
        // Ignorer les erreurs
      }
    });
    this.frames = [];

    // Supprimer tous les event listeners
    this.listeners.forEach(({ target, event, handler }) => {
      try {
        target.removeEventListener(event, handler);
      } catch (e) {
        // Ignorer les erreurs
      }
    });
    this.listeners = [];
  }

  reset() {
    this.cleanup();
    this.isRunning = false;
  }

  startGame() {
    this.reset();
    this.isRunning = true;
  }
}

export const gameManager = new GameManager();
