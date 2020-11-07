import hiragana from "./hiragana";
import hiraganaAccents from "./hiraganaAccents";
import katakana from "./katakana";
import katakanaAccents from "./katakanaAccents";

function combineSmallKanaToKana({ kana, smallKana }) {
    const kanaWithoutEnd = kana.answer.substring(0, kana.answer.length - 1);
    const smallKanaFiltered = ["sh", "j", "ch"].includes(kanaWithoutEnd)
        ? smallKana.answer.substring(1)
        : smallKana.answer;
    
    const word = kana.word + smallKana.word;
    const answer = kanaWithoutEnd + smallKanaFiltered;

    return { word, answer };
};

function combine(kanaList, smallKanaList) {
    const filteredKanaList = kanaList.filter(kana => {
        const answerLength = kana.answer.length;
        const lastSyllable = kana.answer[answerLength - 1];
        const isJi = ["ぢ", "ヂ"].includes(kana.word);

        return answerLength > 1 && lastSyllable === "i" && !isJi;
    });

    const results = [];
    for (const kana of filteredKanaList)
        for (const smallKana of smallKanaList) {
            const combination = combineSmallKanaToKana({ kana, smallKana });
            results.push(combination);
        }

    return results;
};

const smallHiragana = [
    { word: "ゃ", answer: "ya" },
    { word: "ゅ", answer: "yu" },
    { word: "ょ", answer: "yo" },
];

const smallKatakana = [
    { word: "ャ", answer: "ya" },
    { word: "ュ", answer: "yu" },
    { word: "ョ", answer: "yo" },
];

const allHiragana = [...hiragana, ...hiraganaAccents];
const allKatakana = [...katakana, ...katakanaAccents];

export const hiraganaCombinations = combine(allHiragana, smallHiragana);
export const katakanaCombinations = combine(allKatakana, smallKatakana);