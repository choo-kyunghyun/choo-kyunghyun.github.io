"use strict";

class Lotto {
    constructor() {
        this.numbers = [];
    }

    pick() {
        this.numbers = [];
        while (this.numbers.length < 6) {
            let number = Math.floor(Math.random() * 45) + 1;
            if (!this.numbers.includes(number)) {
                this.numbers.push(number);
            }
        }
        this.numbers.sort(function(a, b) {
            return a - b;
        });
    }

    colorize(_num) {
        if (_num >= 1 && _num < 11) {
            return "#fbc400";
        } else if (_num >= 11 && _num < 21) {
            return "#69c8f2";
        } else if (_num >= 21 && _num < 31) {
            return "#ff7272";
        } else if (_num >= 31 && _num < 41) {
            return "#aaaaaa";
        } else if (_num >= 41 && _num < 46) {
            return "#b0d840";
        } else {
            return "#333333";
        }
    }

    check(_jackpot, _bonus) {
        let count = 0;
        for (let i = 0; i < this.numbers.length; i++) {
            if (_jackpot.includes(this.numbers[i])) {
                count += 2;
            } else if (_bonus === this.numbers[i]) {
                count += 1;
            }
        }
        return count;
    }

    export(_jackpot, _bonus) {
        let count = 0;
        let plus = false;

        let serial = document.createElement("div");
        serial.style.outline = "2px solid #333333";
        serial.style.borderRadius = "0.5rem";
        serial.style.padding = "1rem 0 0 0";
        serial.classList.add("container");

        for (let i = 0; i < this.numbers.length; i++) {
            let number = document.createElement("div");
            number.classList.add("ball");
            if (_jackpot.includes(this.numbers[i])) {
                number.style.backgroundColor = this.colorize(this.numbers[i]);
                count++;
            } else if (_bonus === this.numbers[i]) {
                number.style.backgroundColor = this.colorize(this.numbers[i]);
                plus = true;
            } else {
                number.style.backgroundColor = "#333333";
            }
            number.style.color = "#ffffff";
            number.textContent = this.numbers[i];
            serial.appendChild(number);
        }

        let matched = document.createElement("div");
        matched.innerHTML = `<div style="font-size: 1.5rem; margin-top: 0.45rem">${count + (plus ? " + 1" : "")}</div>`;
        serial.appendChild(matched);
        
        return serial;
    }
}

class Jackpot extends Lotto {
    constructor() {
        super();
        this.bonus = 0;
    }

    pick() {
        super.pick();
        do {
            this.bonus = Math.floor(Math.random() * 45) + 1;
        } while (this.numbers.includes(this.bonus));
    }

    export() {
        let serial = document.createElement("div");
        serial.classList.add("container");
        for (let i = 0; i < this.numbers.length; i++) {
            let number = document.createElement("div");
            number.innerHTML = `<div class="ball" style="background-color: ${this.colorize(this.numbers[i])}; color: #ffffff;">${this.numbers[i]}</div>`;
            serial.appendChild(number);
        }
        let plus = document.createElement("div");
        plus.innerHTML = `<div style="font-size: 2rem;">+</div>`;
        serial.appendChild(plus);
        let bonus = document.createElement("div");
        bonus.innerHTML = `<div class="ball" style="background-color: ${this.colorize(this.bonus)}; color: #ffffff;">${this.bonus}</div>`;
        serial.appendChild(bonus);
        return serial;
    }
}

const output = document.getElementById("output");
const count = document.getElementById("count");

document.getElementById("check").addEventListener("click", function() {
    output.innerHTML = "";
    let win = new Jackpot();
    win.pick();
    output.appendChild(win.export());
    let lottos = [];
    for (let i = 0; i < count.value; i++) {
        let lotto = new Lotto();
        lotto.pick();
        lottos.push(lotto);
    }
    lottos.sort(function(a, b) {
        return b.check(win.numbers, win.bonus) - a.check(win.numbers, win.bonus);
    });
    for (let i = 0; i < lottos.length; i++) {
        output.appendChild(lottos[i].export(win.numbers, win.bonus));
    }
});
