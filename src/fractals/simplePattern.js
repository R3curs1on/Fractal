// import sleep;
const recursion = ( str , grammer , depth ) => {
    if(depth==0) return str ;
    let nextStr = str.split('').map( currChar => grammer[currChar] || currChar).join('')
    const res = recursion(nextStr , grammer , depth-1);
    console.log(res);
    return res;
}

// const initialStr = `|-_-|\n|-_-|\n|-_-|\n`;
// const grammer = {
//     "_" : "|-_-|\n|-_-|\n|-_-|\n",
//     "|" : "|-_-|\n|---|\n|---|\n|-_-|\n|---|\n|-_-|\n"
// };

// const initialStr = "▓";

// const grammer = {
//     "▓" : "▓░",  // Dark becomes dark+light
//     "░" : "░▓"   // Light becomes light+dark
// };

// const initialStr = "█";

// const grammer = {
//     "█" : "█ █",  // A block becomes two blocks with a space
//     " " : "* █"   // A space becomes three spaces (this keeps the geometry perfectly aligned)
// }; 




// \u25D3
// \u25D4
// \u25D5


// const initialStr = "\u25D2";

// const grammer = {
//     "\u25D2" : "\u25D2 \u25D3",  // A block becomes two blocks with a space
//     " " : "\u25D2 \u25D3 \u25D4 \u25D5"  , // A space becomes three spaces (this keeps the geometry perfectly aligned)
//     "\u25D3" : "\u25D3 \u25D4",
//     "\u25D4" : "\u25D4 \u25D5",
//     "\u25D5" : "\u25D5 \u25D2"
// }; 


const initialStr = "\u25DF";

const grammer = {
    "\u25DF" : "\u25DF \u25DE",  // A block becomes two blocks with a space
    " " : "\u25DF \u25DE \u25DD \u25DC"  , // A space becomes three spaces (this keeps the geometry perfectly aligned)
    "\u25DE" : "\u25DE \u25DD",
    "\u25DD" : "\u25DD \u25DC",
    "\u25DC" : "\u25DC \u25DF"
}; 






console.log(recursion(initialStr,grammer,0));
console.log(recursion(initialStr,grammer,1));
console.log(recursion(initialStr,grammer,2));
console.log(recursion(initialStr,grammer,6));
// console.log(recursion(initialStr,grammer,12));


