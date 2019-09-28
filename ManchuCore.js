
function isManchuScript(str) {
  //return (/(([\u1800-\u18AA\u00AB\u00BB\u2039\u203A\?\!\u203D\u2E2E])+\s*((-*—?[0-9])+\s+)*)+$/.test(str));
  return (/[\u1800-\u18AA]/.test(str));
}
 
function deManchurize(str) {
  var tmp = "";
  if (str.length > 0) {
    for (var i = 0; i < str.length; i++) {
      var val = str.charAt(i);
      var prev = " ";
      if (i > 0) {
        prev = str.charAt(i - 1);
      }
      if (val == "ᠠ") {
        tmp += "a";
      } else if (val == "ᡝ") {
        tmp += "e";
      } else if (val == "ᡳ") {
        tmp += "i";
      } else if (val == "ᠣ") {
        tmp += "o";
      } else if (val == "ᡠ") {
        tmp += "u";
      } else if (val == "ᡡ") {
        tmp += "v";
      } else if (val == "@") {
        tmp += "ᡡ";
      } else if (val == "ᠨ") {
        tmp += "n";
      } else if (val == "ᠩ") {
        tmp += "N";
      } else if (val == "ᠪ") {
        tmp += "b";
      } else if (val == "ᡦ") {
        tmp += "p";
      } else if (val == "ᡧ") {
        tmp += "x";
      } else if (val == "ᡧ") {
        tmp += "S";
      } else if (val == "ᡴ") {
        tmp += "k";
      } else if (val == "ᡤ" || val == "ᠩ") {
        /*       if (prev == "ᠨ" || prev == "n") {
          tmp = tmp.substring(0, tmp.length - 1);
          tmp += "ᠩ";
        } else {
          tmp += "ᡤ";
        }
        */
        tmp += "g";
      } else if (val == "ᡥ") {
        tmp += "h";
      } else if (val == "ᠮ") {
        tmp += "m";
      } else if (val == "ᠯ") {
        tmp += "l";
      } else if (val == "ᡨ") {
        tmp += "t";
      } else if (val == "ᡩ") {
        tmp += "d";
      } else if (val == "ᠰ") { // || val == "ᡮ") {
        /*        if (prev == "ᡨ" || prev == "t") {
          tmp = tmp.substring(0, tmp.length - 1);
          tmp += "ᡮ";
        } else {
          tmp += "ᠰ";
        }
*/
        tmp += "s";
      } else if (val == "ᡮ") { //ᠴ
        tmp += "c";
      } else if (val == "ᠴ") {
        tmp += "q";
      } else if (val == "ᠵ") {
        tmp += "j";
      } else if (val == "ᠶ") {
        tmp += "y";
      } else if (val == "ᡵ") {
        tmp += "r";
      } else if (val == "ᠸ") {
        tmp += "w";
      } else if (val == "ᡶ") {
        tmp += "f";
      } else if (val == "ᠺ") {
        tmp += "K";
      } else if (val == "ᡬ") {
        tmp += "G";
      } else if (val == "ᡭ") {
        tmp += "H";
      } else if (val == "ᡷ") {
        tmp += "J";
      } else if (val == "ᡱ") {
        tmp += "C";
      } else if (val == "ᡰ") {
        tmp += "R";
      } else if (val == "ᡯ") { // "z") {
        /* if (prev == "ᡩ" || prev == "d") {
        tmp = tmp.substring(0, tmp.length - 1);
        tmp += "z";
        } else {
        */
        tmp += "z";
        //}
      } else if (val == "'") {
        tmp += "\u180B";
      } else if (val == "᠉") {
        tmp += "."
      } else if (val == "᠈") {
        tmp += ","
      } else if (val == "\u180C") {
        tmp += "\\";
      } else if (val == "\u180D") {
        tmp += "`";
      } else if (val == "\u180E") {
        tmp += "_";
      } else if (val == "\u202F") {
        tmp += "-";
      } else if (val == "\u200D") {
        tmp += "*";
      } else {
        tmp += val;
      }
    }
  }
  return tmp;
}
 
function Manchurize(str) {
  var tmp = "";
  if (str.length > 0) {
    for (var i = 0; i < str.length; i++) {
      var val = str.charAt(i);
      var prev = " ";
      if (i > 0) {
        prev = str.charAt(i - 1);
      }
      if (val == "a") {
        tmp += "ᠠ";
      } else if (val == "e") {
        tmp += "ᡝ";
      } else if (val == "i") {
        tmp += "ᡳ";
      } else if (val == "o") {
        tmp += "ᠣ";
      } else if (val == "u") {
        tmp += "ᡠ";
      } else if (val == "v") {
        tmp += "ᡡ";
      } else if (val == "@" || val == "ū") {
        tmp += "ᡡ";
      } else if (val == "n") {
        tmp += "ᠨ";
      } else if (val == "N") {
        tmp += "ᠩ";
      } else if (val == "b") {
        tmp += "ᠪ";
      } else if (val == "p") {
        tmp += "ᡦ";
      } else if (val == "x") {
        tmp += "ᡧ";
      } else if (val == "S" || val == "š" || val == "x") {
        tmp += "ᡧ";
      } else if (val == "k") {
        tmp += "ᡴ";
      } else if (val == "g") {
        if (prev == "ᠨ" || prev == "n") {
          tmp = tmp.substring(0, tmp.length - 1);
          tmp += "ᠩ";
        } else {
          tmp += "ᡤ";
        }
      } else if (val == "h") {
        tmp += "ᡥ";
      } else if (val == "m") {
        tmp += "ᠮ";
      } else if (val == "l") {
        tmp += "ᠯ";
      } else if (val == "t") {
        tmp += "ᡨ";
      } else if (val == "d") {
        tmp += "ᡩ";
      } else if (val == "s") {
        if (prev == "ᡨ" || prev == "t") {
          tmp = tmp.substring(0, tmp.length - 1);
          tmp += "ᡮ";
        } else {
          tmp += "ᠰ";
        }
      } else if (val == "c" || val == "q") {
        tmp += "ᠴ";
      } else if (val == "j") {
        tmp += "ᠵ";
      } else if (val == "y") {
        tmp += "ᠶ";
      } else if (val == "r") {
        tmp += "ᡵ";
      } else if (val == "w") {
        tmp += "ᠸ";
      } else if (val == "f") {
        tmp += "ᡶ";
      } else if (val == "K") {
        tmp += "ᠺ";
      } else if (val == "G") {
        tmp += "ᡬ";
      } else if (val == "H") {
        tmp += "ᡭ";
      } else if (val == "J") {
        tmp += "ᡷ";
      } else if (val == "C") {
        tmp += "ᡱ";
      } else if (val == "R") {
        tmp += "ᡰ";
      } else if (val == "z") {
        if (prev == "ᡩ" || prev == "d") {
          tmp = tmp.substring(0, tmp.length - 1);
          tmp += "ᡯ";
        } else {
          tmp += "ᡯ"; //"z" org
        }
      } else if (val == "'") {
        tmp += "\u180B";
      } else if (val == "." || val == ":") {
        tmp += "᠉"
      } else if (val == ",") {
        tmp += "᠈"
      } else if (val == "\"") {
        tmp += "\u180C";
      } else if (val == "`") {
        tmp += "\u180D";
      } else if (val == "_") {
        tmp += "\u180E";
      } else if (val == "-") {
        tmp += "\u202F";
      } else if (val == "*") {
        tmp += "\u200D";
      } else {
        tmp += val;
      }
    }
  }
  return tmp;
}

module.exports ={Manchurize, deManchurize, isManchuScript };