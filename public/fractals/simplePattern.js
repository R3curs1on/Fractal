
/*
    for pattern like this 
                 _
     _         _|_|_
    |_| ->    |_|_|_|
                |_|
    ie expand outermost side with Edge itself ; 
    we can use xy plane with set<side> vis to update recursively and inserting side so that marks we have drawn a side ;
    - no memory of grid except set ; 
    - extra printing function only ;  
*/


const render = ( Edges ) =>{
    const Xpos  = 0 , Xneg  = 0 , Ypos  = 0  , Yneg  = 0 ;
    const findMaxXcoord = (Edges) ={

    }

    Xpos = Math.abs(findMaxXcoord) ;
    Xneg = -Math.abs(findMaxXcoord);

    const findMaxYcoord = (Edges) ={

    }

    Ypos = Math.abs(findMaxYcoord) ;
    Yneg = -Math.abs(findMaxYcoord);
    
    // now grid will be of 2*Xpos * 2*Ypos 
    // we need to mark  only sides/ segment in set:Edges

}

class Edge{
    constructor(x,y,dir){
        this.x=x;
        this.y=y;
        this.dir = dir;
    }

}


class Square{
    constructor(bottomLeftX, bottomLeftY){
        this.x = bottomLeftX;
        this.y = bottomLeftY;
    }
}



function compute (currEdges ) {

}
const recursion = ( currEdges , depth ) => {
    if(depth==0) return str ;   
    const nextSq = compute(Edges);
    return recursion( nextSq , depth-1 );
}
const currSet = new Set();
currSet.add(Edge(0,0,"top"));
currSet.add(Edge(0,0,"right"));
currSet.add(Edge(1,1,"left"));
currSet.add(Edge(1,1,"down"));


render(currSet);

render( recursion(currSet,1));






