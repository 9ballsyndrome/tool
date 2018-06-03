/**
 * romeToHiragana
 * 参考 http://www.pandanoir.info/entry/2016/03/29/190000
 */
const table = {
  "k": "かきくけこ", "g": "がぎぐげご", "s": "さしすせそ", "z": "ざじずぜぞ", "t": "たちつてと",
  "d": "だぢづでど", "n": "なにぬねの", "h": "はひふへほ", "b": "ばびぶべぼ", "p": "ぱぴぷぺぽ", "m": "まみむめも",
  "y": "やxゆxよ", "r": "らりるれろ", "w": "わゐうゑを", "x": "ぁぃぅぇぉ", "l": "ぁぃぅぇぉ"
};

function isConsonant(str) {
  return /[kgszcjtdnhbpmyrwxl]/.test(str);
}

function isVowel(str) {
  return /[aiueo]/.test(str);
}

function yayuyeyo(str) {
  return "ゃゅぇょ".charAt("aueo".indexOf(str));
}

function yayiyuyeyo(str) {
  return "ゃぃゅぇょ".charAt("aiueo".indexOf(str));
}

function romeToHiragana(str) {
  let res = "";
  for (let i = 0, _i = str.length; i < _i; i++) {
    const char0 = str.charAt(i);
    if (isConsonant(char0)) {
      if (str.charAt(i + 1) === "y") {
        res += table[char0].charAt(1) + yayiyuyeyo(str.charAt(i + 2));
        i += 2;
      } else if (str.slice(i, i + 2) === "nn") {
        res += "ん";
        i += 1;
      } else if (char0 === "n" && (isConsonant(str.charAt(i + 1)) || i === _i - 1)) {
        res += "ん";
      } else if (str.charAt(i + 1) === char0) {
        res += "っ";
      } else if (str.slice(i, i + 3) === "tsu") {
        res += "つ";
        i += 2;
      } else if (char0 === "j") {
        res += "じ";
        res += yayuyeyo(str.charAt(i + 1));
        i += 1;
      } else if (str.slice(i, i + 2) === "sh" || str.slice(i, i + 2) === "ch") {
        res += str.slice(i, i + 2) === "sh" ? "し" : "ち";
        res += yayuyeyo(str.charAt(i + 2));
        i += 2;
      } else if (str.slice(i, i + 2) === "th") {
        res += "て";
        res += yayiyuyeyo(str.charAt(i + 2));
        i += 2;
      } else {
        if (isVowel(str.charAt(i + 1))) {
          res += table[char0].charAt("aiueo".indexOf(str.charAt(i + 1)));
          i += 1;
        }
      }
    } else if (isVowel(char0)) {
      res += "あいうえお".charAt("aiueo".indexOf(char0));
    } else if (char0 === "-") {
      res += "ー";
    } else if (char0 === ",") {
      res += "、";
    } else if (char0 === ".") {
      res += "。";
    }
  }
  return res;
}

async function getKanijiData(hiragana) {
  return fetch("https://www.google.com/transliterate?langpair=ja-Hira|ja&text=" + hiragana)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        return null;
      }
    })
    .catch(reason => null);
}

function getKanijiString(json, index) {
  let str = "";
  const length = json.length;
  for (let i = 0; i < length; i++) {
    str += json[i][1][index];
  }
  return str;
}

async function translateJapanese() {
  const activeElement = document.activeElement;

  const isForm = (activeElement instanceof HTMLInputElement && (activeElement.type === "text" || activeElement.type === "search"))
    || activeElement instanceof HTMLTextAreaElement;
  if (isForm || (activeElement instanceof HTMLDivElement && activeElement.contentEditable)) {
    let str = isForm ? activeElement.value : activeElement.innerText;
    let reFlag = false;
    let translateData = window.translateData;
    if (translateData && str === translateData.lastStr) {
      reFlag = true;
      str = translateData.inputStr;
    }
    const REG = /:.+?:/;
    const regMatch = str.match(REG);
    const rome = regMatch ? regMatch[0].slice(1, -1) : str;
    const hiragana = romeToHiragana(rome);
    if (hiragana) {
      let kanjiData;
      let index;
      if (reFlag) {
        kanjiData = translateData.json;
        index = (translateData.index + 1) % 5;
      } else {
        kanjiData = await getKanijiData(hiragana);
        index = 0;
        if (!window.translateData) {
          translateData = {};
          window.translateData = translateData;
        }
        translateData.inputStr = str;
        translateData.json = kanjiData;
      }
      translateData.index = index;
      let kanji;
      if (kanjiData) {
        kanji = getKanijiString(kanjiData, index);
      } else {
        kanji = hiragana;
      }
      const result = regMatch ? str.replace(REG, kanji) : kanji;
      translateData.lastStr = result;
      if (isForm) {
        activeElement.value = result;
      } else {
        activeElement.innerText = result;
      }
    }
  }
}

translateJapanese();