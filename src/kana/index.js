import hiragana from "./hiragana";
import hiraganaAccents from "./hiraganaAccents";
import katakana from "./katakana";
import katakanaAccents from "./katakanaAccents";
import { hiraganaCombinations, katakanaCombinations } from "./combinations";
import newKatakanaCombinations from "./newKatakanaCombinations";

export default {
    "Hiragana": hiragana,
    "Katakana": katakana,

    "Hiragana Accents": hiraganaAccents,
    "Katakana Accents": katakanaAccents,

    "Les Combinaisons Hiragana": hiraganaCombinations,
    "Les Combinaisons Katakana": katakanaCombinations,

    "Les Nouvelles Combinaisons Katakana": newKatakanaCombinations,
};