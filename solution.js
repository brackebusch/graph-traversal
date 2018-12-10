function solution(S) {
  // write your code in JavaScript (Node.js 8.9.4)
  //split string up, make easier to mentally process...
  const graph = [[]]
  let start = null
  let end = null
  let j = 0
  let k = 0
  
  for(let i = 0; i < S.length; i++){
      if(S[i] === 'O'){
          start = [j,k]
      } else if (S[i] === 'T') {
          end = [j,k]
      } else if (S[i] === ';') {
          j++
          k = 0
          graph.push([])
          continue
      }
      graph[j][k] = S[i]
      k++
  }

  return findFastest(start, end, graph)
}

class Node {
  constructor(location, end, previousDistance){
      this.location = location //[x,y] coordinate
      this.distanceFromTarget = this.distance(location, end)
      this.distanceTraveled = previousDistance + 1
      this.cost = this.distanceTraveled + this.distanceFromTarget
      this.index = null
  }
  
  distance(location, end){
      return(Math.abs(location[0] - end[0]) + Math.abs(location[1] - end[1]))
  }
}


class Heap {
  constructor() {
      this.data = []
      this.set = new Set()
  }

  push(el) {
      this.data.push(el)
      this.data[this.data.length -1].index = this.data.length - 1 //assign index to newly added node
      this.heapifyUp(this.data.length - 1)
  }

  pop() {
      if(this.data.length < 1){
          return null
      } else if (this.data.length === 1){
          return this.data.pop()
      }

      this.swap(0, this.data.length - 1)
      const element = this.data.pop()
      this.heapifyDown(0)
      return element
  }

  peek() {
    if(this.data.length < 1){
      return null
    }

    return this.data[0]
  }

  heapifyUp(childIndex) {
      if(childIndex === 0){
          return //no parent
      }

      const parentIndex = Math.floor(childIndex - 1 / 2)

      //this will prioritize new nodes, aka depth first search, in case of tie
      if (this.data[childIndex].cost <= this.data[parentIndex].cost){
          //swap with parent
          this.swap(parentIndex, childIndex)
          this.heapifyUp(parentIndex)
      }
  }

  heapifyDown(parentIndex) {
      let smallerChildIndex

      if(this.data.length - 1 < parentIndex * 2 + 1){
          return //no children
      } else if (this.data.length - 1 < parentIndex * 2 + 2) {
          smallerChildIndex = parentIndex * 2 //only one child            
      } else {
          smallerChildIndex = this.data[parentIndex * 2 + 1].cost > this.data[parentIndex * 2 + 2].cost ?  parentIndex * 2 + 2 : parentIndex * 2 + 1
      }

      if (this.data[smallerChildIndex].cost < this.data[parentIndex].cost){
          //swap with smaller child
          this.swap(smallerChildIndex, parentIndex)
          this.heapifyDown(smallerChildIndex)
      }
  }

  swap(firstIndex, secondIndex) {
      //make sure to reassign location inside of Heap when moving items (for outside reference)
      const temp = this.data[firstIndex]
      this.data[firstIndex] = this.data[secondIndex]
      this.data[firstIndex].index = firstIndex
      this.data[secondIndex] = temp
      this.data[secondIndex].index = secondIndex
  }
}


function findFastest(start, end, graph){
  if(start === null || end === null){
      return(-2)   
  }
  //need to remember all nodes visited
  //also need to keep track of all nodes which are waiting to be visited
  const nodeHeap = new Heap() //priority queue for handling locaitons to visit
  const inNodeHeap = {} //hash pointing to nodes, key is node location 'row,col' and value will point to the node object
  const processed = new Set() //nodes we have seen in the heap, so they are not revisited
 
  let startNode = new Node(start, end, -1)
  nodeHeap.push(startNode)
  for(let i = 0; i < graph.length; i++){
    console.log(graph[i])
  }

  while(nodeHeap.peek() !== null){
      const next = nodeHeap.pop()
      processed.add(`${next.location[0]},${next.location[1]}`)
      delete inNodeHeap[`${next.location[0]},${next.location[1]}`]

      if(graph[next.location[0]][next.location[1]] === 'T'){
        console.log(next.cost)
        return next.cost //this is the final node
      } else {
          //get each neighbor and add it to toBeProcessed
          const neighbors = getNeighbors(next.location, graph)
          for(let i = 0; i < neighbors.length; i++){
              const row = neighbors[i][0]
              const col = neighbors[i][1]
              const tempNode = new Node([row,col], end, next.distanceTraveled)
              if(processed.has(`${row},${col}`)){
                continue //we would only process something if it has/had a higher priority and better path
              } else if (inNodeHeap.hasOwnProperty(`${row},${col}`)) {
                //node location is currently in the heap, added via another neighbor
                //check to see if it has higher priority and update if so
                if(tempNode.cost < inNodeHeap[`${row},${col}`].cost){
                  inNodeHeap[`${row},${col}`].distanceTraveled = tempNode.distanceTraveled
                  inNodeHeap[`${row},${col}`].cost = tempNode.cost
                  nodeHeap.heapifyUp(inNodeHeap[`${row},${col}`].index)
                }
                continue
              } else {
                nodeHeap.push(tempNode)
              }
          }
      }
  }
  console.log('no valid moves');
  
  return -2
}

function getNeighbors(location, graph){
  //really when saying [x,y] you are saying y,x on a plain, 
  //so this is row,col and to go up we shift the row and to go left/right we shift the col
  const row = location[0]
  const col = location[1]
  const neighbors = []

  //top is move up a row, hence row-1
  if(row - 1 > -1 && graph[row - 1][col] !== 'X'){
      neighbors.push([row - 1, col])
  }
  //down is move down a row, hence row+1
  if(typeof graph[row + 1] !== "undefined" && graph[row + 1][col] !== 'X'){
    neighbors.push([row + 1, col])
  }
  //left move col over
  if(col - 1 > -1 && graph[row][col - 1] !== 'X'){
      neighbors.push([row, col - 1])
  }
  //right move col over
  if(typeof graph[row][col+1] !== "undefined" && graph[row][col+1] !== 'X'){
      neighbors.push([row, col + 1])
  }

  return neighbors
}
