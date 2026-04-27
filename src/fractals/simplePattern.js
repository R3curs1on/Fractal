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


// const initialStr = "\u25DF";

// const grammer = {
//     "\u25DF" : "\u25DF \u25DE",  // A block becomes two blocks with a space
//     " " : "\u25DF \u25DE \u25DD \u25DC"  , // A space becomes three spaces (this keeps the geometry perfectly aligned)
//     "\u25DE" : "\u25DE \u25DD",
//     "\u25DD" : "\u25DD \u25DC",
//     "\u25DC" : "\u25DC \u25DF"
// }; 


const initialStr = `_\n| |\n _`;

const grammer = {
    "_" : "_\n| |\n _" ,
    "|" : "_\n| |\n _" ,
}; 

console.log(recursion(initialStr,grammer,0));
console.log(recursion(initialStr,grammer,1));
console.log(recursion(initialStr,grammer,2));
console.log(recursion(initialStr,grammer,6));
// console.log(recursion(initialStr,grammer,12));




const initialGrid  = [["|","_"],["_","|"]]
const grammerGrid = {
    "_" : [["|","_"],["_","|"]],
    "|" : [["|","_"],["_","|"]]
}

const expand = (grid, grammar) => {
    const newGrid = [];

    grid.forEach(row => {
        let blockRows = [];

        row.forEach(cell => {
            const block = grammar[cell] ;

            block.forEach((blockRow, i) => {
                if (!blockRows[i]) blockRows[i] = [];
                blockRows[i].push(...blockRow);
            });
        });

        newGrid.push(...blockRows);
    });

    return newGrid;
};

const recursionGrid  = (initialGrid , grammerGrid , depth)=>{
    if (depth==0 ) return initialGrid;

    const nextGrid = expand(initialGrid,grammerGrid);
    return recursionGrid(nextGrid,grammerGrid,depth-1);
}   


