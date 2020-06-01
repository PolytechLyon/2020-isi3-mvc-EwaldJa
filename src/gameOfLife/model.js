import {
  GAME_SIZE,
  CELL_STATES,
  DEFAULT_ALIVE_PAIRS,
  RENDER_INTERVAL
} from "./constants";

export class Model {
  constructor(viewCallback) {
    this.viewCallback = viewCallback;
    this.width = GAME_SIZE;
    this.height = GAME_SIZE;
    this.raf = null;
  }

  init() {
    this.state = Array.from(new Array(this.height), () =>
      Array.from(new Array(this.width), () => CELL_STATES.NONE)
    );
    DEFAULT_ALIVE_PAIRS.forEach(([x, y]) => {
      this.state[y][x] = CELL_STATES.ALIVE;
    });
    this.updated();
  }

  run(date = new Date().getTime()) {
    this.raf = requestAnimationFrame(() => {
      const currentTime = new Date().getTime();
      if (currentTime - date > RENDER_INTERVAL) {
        //permet de ne pas modifier l'état actuel, sinon on ne peut pas récupérer les cellules voisines en vie
        var tmpState = this.state.map(function(subArray) {
          return subArray.slice();
        });
        let changed = false;
        for (let x = 0; x < this.width; x++) {
          for (let y = 0; y < this.width; y++) {
            const nbAlive = this.aliveNeighbours(x, y);
            const previousWasAlive = this.isCellAlive(x, y);
            if (!previousWasAlive && nbAlive === 3) {
              tmpState[y][x] = CELL_STATES.ALIVE;
              changed = true;
            } else if (previousWasAlive && (nbAlive < 2 || nbAlive > 3)) {
              tmpState[y][x] = CELL_STATES.DEAD;
              changed = true;
            }
          }
        }
        if (changed) {
          this.state = tmpState;
          this.updated();
          this.run(currentTime);
        } else {
          this.stop();
        }
      } else {
        this.run(date);
      }
    });
  }

  stop() {
    cancelAnimationFrame(this.raf);
    this.raf = null;
  }

  reset() {
    this.stop();
    this.init();
  }

  isCellAlive(x, y) {
    return x >= 0 &&
      y >= 0 &&
      y < this.height &&
      x < this.height &&
      this.state[y][x] === CELL_STATES.ALIVE
      ? 1
      : 0;
  }

  aliveNeighbours(x, y) {
    let number = 0;
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        if (this.isCellAlive(x + i, y + j)) {
          number++;
        }
      }
    }
    //Evite de faire un if i et j à 0 à chaque itération
    if (this.isCellAlive(x, y)) {
      number--;
    }
    return number;
  }

  updated() {
    this.viewCallback(this);
  }
}
