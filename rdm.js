var crc32=function(r){for(var a,o=[],c=0;c<256;c++){a=c;for(var f=0;f<8;f++)a=1&a?3988292384^a>>>1:a>>>1;o[c]=a}for(var n=-1,t=0;t<r.length;t++)n=n>>>8^o[255&(n^r.charCodeAt(t))];return((-1^n)>>>0).toString(10)};

//console.log(crc32('abc')); //object

//console.log(crc32('abc').toString(16).toUpperCase()); // hex
module.exports ={crc32};