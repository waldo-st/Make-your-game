export function CreateField(){
    const w=10
    const h=20
    let grid = document.querySelector(".grid");
    let board=[]
    for (let x = 0; x < h; x++) {
        let row=[]
        for (let y = 0; y < w; y++) {
            let cell2 = document.createElement("div")
            cell2.classList.add("vide")
            row.push({value:0,element:cell2})
            grid.appendChild(cell2)
        }
        board.push(row)
    }
    return board
}
export function FieldNext(){
    const w=4
    const h=3
    let block = document.querySelector(".case");
    let board=[]
    for (let x = 0; x < h; x++) {
        let row=[]
        for (let y = 0; y < w; y++) {
            let cell = document.createElement("div")
            cell.classList.add("vide")
            row.push({value:0,element:cell})
            block.appendChild(cell)
        }
        board.push(row)
    }
    return board
}
export function FieldScore(){
    var containe =document.querySelector(".tableau")
    var h1=document.createElement("h2")
    h1.textContent="score"
    var div1=document.createElement("div")
    div1.classList="score"
    div1.textContent="0"
    var h2=document.createElement("h2")
    h2.textContent="Level"
    var div2=document.createElement("div")
    div2.classList="level"
    div2.textContent="1"
    containe.append(h1,div1,h2,div2)
}

