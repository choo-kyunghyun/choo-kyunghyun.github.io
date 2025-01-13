"use strict";

class Lotto {
  constructor(bonus = false) {
    this.numbers = [];
    this.bonus = 0;
    this.count = 0;
    this.pick(bonus);
  }

  pick(bonus) {
    const allNumbers = Array.from({ length: 45 }, (_, i) => i + 1);
    for (let i = allNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allNumbers[i], allNumbers[j]] = [allNumbers[j], allNumbers[i]];
    }
    if (bonus) {
      this.numbers = allNumbers.slice(0, 7);
      this.bonus = this.numbers.pop();
      this.numbers.sort((a, b) => a - b);
    } else {
      this.numbers = allNumbers.slice(0, 6).sort((a, b) => a - b);
    }
  }

  colorize(num) {
    if (num < 11) return "#fbc400";
    if (num < 21) return "#69c8f2";
    if (num < 31) return "#ff7272";
    if (num < 41) return "#aaaaaa";
    if (num < 46) return "#b0d840";
    return "#333333";
  }

  check(jackpot, bonus) {
    this.count = this.numbers.filter((num) => jackpot.includes(num)).length;
    this.bonus = this.numbers.includes(bonus) ? 1 : 0;
  }

  ball(num, backgroundColor) {
    const ball = document.createElement("span");
    ball.style.backgroundColor = backgroundColor;
    ball.style.color = "#ffffff";
    ball.style.width = "3rem";
    ball.style.height = "3rem";
    ball.style.borderRadius = "50%";
    ball.style.alignContent = "center";
    ball.style.fontSize = "1.5rem";
    ball.textContent = num;
    return ball;
  }

  rank() {
    switch (this.count) {
      case 6:
        return "1st";
      case 5:
        return this.bonus ? "2nd" : "3rd";
      case 4:
        return "4th";
      case 3:
        return "5th";
      default:
        return "bad";
    }
  }

  export(jackpot, bonus) {
    const serial = document.createElement("span");
    serial.style.padding = "1rem";
    serial.classList.add("box");

    this.numbers.forEach((num) => {
      const number = this.ball(
        num,
        jackpot.includes(num) || bonus === num ? this.colorize(num) : "#333333"
      );
      serial.appendChild(number);
    });

    const matched = document.createElement("span");
    matched.style.fontSize = "1.5rem";
    matched.style.marginTop = "0.45rem";
    matched.textContent = this.rank();
    serial.appendChild(matched);
    return serial;
  }
}

class Jackpot extends Lotto {
  constructor() {
    super(true);
  }

  export() {
    const serial = document.createElement("span");
    serial.style.padding = "1rem";
    serial.classList.add("box");

    this.numbers.forEach((num) => {
      const number = this.ball(num, this.colorize(num));
      serial.appendChild(number);
    });

    const plus = document.createElement("span");
    plus.style.fontSize = "2rem";
    plus.textContent = "+";
    serial.appendChild(plus);

    const bonus = this.ball(this.bonus, this.colorize(this.bonus));
    serial.appendChild(bonus);
    return serial;
  }
}

const output = document.getElementById("output");
const count = document.getElementById("count");

document.getElementById("check").addEventListener("click", () => {
  output.replaceChildren();
  const win = new Jackpot();
  output.appendChild(win.export());
  const lottos = Array.from({ length: count.value }, () => {
    const lotto = new Lotto();
    lotto.check(win.numbers, win.bonus);
    return lotto;
  });
  lottos.sort((a, b) => b.count * 2 + b.bonus - (a.count * 2 + a.bonus));
  lottos.forEach((lotto) =>
    output.appendChild(lotto.export(win.numbers, win.bonus))
  );
});
