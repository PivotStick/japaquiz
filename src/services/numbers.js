import numbers from "../vocabulary/numbers";

const exceptions = {
    "300": { second: "ビャク" },
    "600": { first: "ロッ", second: "ピャク" },
    "800": { first: "ハッ", second: "ピャク" },
    "3000": { second: "ゼン" },
    "8000": { first: "ハッ" },
};

function unfoldNumber(number) {
    number = number.toString();
    number = number.split("");
    number.reverse();

    const mapFunction = (num, i) => num * Math.pow(10, i);
    const result = number.map(mapFunction);

    return result.reverse();
};

function getKansuji(number) {
    const result = unfoldNumber(number);
    let kanji = "";
    let katakana = "";

    for (const num of result) {
        const firstDigit = num.toString()[0];
        const unit = (num / firstDigit).toString();

        const shouldSkip = firstDigit === "1" && num > 1;
        if (shouldSkip) continue;

        const first = numbers.find(v => v.meaning === firstDigit);
        const second = numbers.find(v => unit >= 10 ? v.meaning === unit : false);

        const variants = exceptions[num] || {};

        for (const [i, char] of [first, second].entries())
            if (char !== undefined) {
                const isArray = char.answer instanceof Array;
                const kana = isArray ? char.answer[1] : char.answer;

                kanji += char.word;
                katakana += variants[i === 0 ? "first" : "second"] || kana;
            }
    }

    return {
        kanji,
        katakana,
    };
};

function getRandomNumber() {
    const randomFloat = Math.random() * 9999;
    const randomInt = Math.ceil(randomFloat);

    return randomInt;
};

function formatNumber(number) {
    number = number.toString().split("");
    number = number.reverse().join("");

    number = number.replace(/\d{3}/g, m => `${m} `);

    number = number.split("");
    number = number.reverse().join("");

    return number.trim();
};

export {
    formatNumber,
    getRandomNumber,
    getKansuji,

    exceptions,
};