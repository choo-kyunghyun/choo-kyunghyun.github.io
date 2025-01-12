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
    return `
      <div style="
        background-color: ${backgroundColor};
        color: #ffffff;
        width: 3rem;
        height: 3rem;
        border-radius: 50%;
        align-content: center;
        font-size: 1.5rem";
      >${num}</div>
    `;
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
    let serial = document.createElement("span");
    serial.style.padding = "1rem";
    serial.classList.add("box");

    this.numbers.forEach((num) => {
      let number = document.createElement("span");
      number.innerHTML = this.ball(
        num,
        jackpot.includes(num) || bonus === num ? this.colorize(num) : "#333333"
      );
      serial.appendChild(number);
    });

    let matched = document.createElement("span");
    matched.innerHTML = `<div style="font-size: 1.5rem; margin-top: 0.45rem">${this.rank()}</div>`;
    serial.appendChild(matched);
    return serial;
  }
}

class Jackpot extends Lotto {
  constructor() {
    super(true);
  }

  export() {
    let serial = document.createElement("span");
    serial.style.padding = "1rem";
    serial.classList.add("box");

    this.numbers.forEach((num) => {
      let number = document.createElement("span");
      number.innerHTML = this.ball(num, this.colorize(num));
      serial.appendChild(number);
    });

    let plus = document.createElement("span");
    plus.innerHTML = `<div style="font-size: 2rem;">+</div>`;
    serial.appendChild(plus);

    let bonus = document.createElement("span");
    bonus.innerHTML = this.ball(this.bonus, this.colorize(this.bonus));
    serial.appendChild(bonus);
    return serial;
  }
}

const output = document.getElementById("output");
const count = document.getElementById("count");

document.getElementById("check").addEventListener("click", () => {
  output.innerHTML = "";
  const win = new Jackpot();
  output.appendChild(win.export());
  const lottos = Array.from({ length: count.value }, () => {
    let lotto = new Lotto();
    lotto.check(win.numbers, win.bonus);
    return lotto;
  });
  lottos.sort((a, b) => b.count * 2 + b.bonus - (a.count * 2 + a.bonus));
  lottos.forEach((lotto) =>
    output.appendChild(lotto.export(win.numbers, win.bonus))
  );
});
