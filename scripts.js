var canvas
var center
var spells
var progress_interval
var prepared_spells

window.onload = Load

//PRIVATE FUNCTIONS
function Load() {
    canvas = document.getElementById("main_canvas")
    center = {"x": canvas.width / 2, "y": canvas.height / 2}
    spells = []
    prepared_spells = []

    progress_interval = setInterval(Progress, 20)
}

function Draw(what) {

    const drawing_context = canvas.getContext("2d")
    
    let spell = what
    drawing_context.strokeStyle = GetSpellColor(spell.spelltype)
    drawing_context.fillStyle = GetSpellColor(spell.spelltype)
    drawing_context.beginPath()
    drawing_context.ellipse(spell.position.x, spell.position.y, spell.size.x, spell.size.y, spell.rotation, 0, 2 * Math.PI)
    drawing_context.fill()
    drawing_context.stroke()
}

function Clear() {

    const drawing_context = canvas.getContext("2d");
    drawing_context.clearRect(0, 0, canvas.width, canvas.height); 
}

function Progress() {

    Clear()

    for (let i = 0; i < spells.length; i++) {
        const spell = spells[i];
        if (spell.duration > 0) {

            Draw(spell)

            spell.duration -= 0.02
            spell.position.x += spell.acceleration.x
            spell.position.y += spell.acceleration.y

        }
        else {
            spell.subspells = []
            spells.splice(i, 1)
            i--
        }
    }
}

function GetSpellColor(spellname) {

    let color
    switch (spellname) {
        case "fire": color = "#ff0000"; break;
        case "water": color = "#1010ff"; break;
        default: color = "#000000"; break;
    }
    return color
}

//PUBLIC FUNCTIONS

function Create(what) { //what is a string with the spell's element

    let spell = {
        "spelltype": what,
        "position": {...center},
        "size": {"x": 5, "y": 5},
        "rotation": 0,
        "acceleration": {"x": 0, "y": 0},
        "duration": 1,
        "subspells": []
    }

    spell.position.x -= spell.size.x / 2
    spell.position.y -= spell.size.y / 2

    spell.subspells.push(spell)

    spells.push(spell)
    return spell
} 

function Extend(what, func_modifier = 0) { //what is a spell, func_modifier is the strength

    what.subspells.forEach(spell => {

    if (func_modifier >= 0)
        spell.duration *= 2 + func_modifier

    else if (func_modifier < 0)
        spell.duration /= 2 - func_modifier

    })
    return what
}

function Move(what, direction, func_modifier = 0) { //what is a spell, direction is an object containing x and y that has to be between 1 and -1, func_modifier is the strength

    direction.x *= 10
    direction.y *= 10

    what.subspells.forEach(spell => {

    if (func_modifier >= 0) {
        spell.position.x += direction.x * (1 + func_modifier)
        spell.position.y += direction.y * (1 + func_modifier)
    }

    else if (func_modifier < 0) {
        spell.position.x += direction.x / (1 - func_modifier)
        spell.position.y += direction.y / (1 - func_modifier)
    }

    })

    return what
}

function Rotate(what, func_modifier = 90) { //what is a spell, func_modifier is the strength in degrees

    func_modifier *=  Math.PI / 180

    what.subspells.forEach(spell => {

        spell.rotation = (spell.rotation + func_modifier) % (2 * Math.PI)
    })

    return what
}

function Expand(what, direction, func_modifier = 0) { //what is a spell, direction is an object containing x and y that has to be between 1 and -1, func_modifier is the strength

    const size_modifier = {"x": 0, "y": 0}
    direction.x *= 2
    direction.y *= 2

    if (func_modifier >= 0) {
        size_modifier.x = direction.x * (1 + func_modifier)
        size_modifier.y = direction.y * (1 + func_modifier)
    }

    else if (func_modifier < 0) {
        size_modifier.x = direction.x / (1 - func_modifier)
        size_modifier.y = direction.y / (1 - func_modifier)
    }

    what.subspells.forEach(spell => {

        if (size_modifier.x > 0) spell.size.x += size_modifier.x
        else {
            spell.size.x -= size_modifier.x
            spell.position.x -= size_modifier.x
        }

        if (size_modifier.y > 0) spell.size.y += size_modifier.y
        else {
            spell.size.y -= size_modifier.y
            spell.position.y -= size_modifier.y
        }
    })

    return what
}

function Launch(what, direction, func_modifier = 0) { //what is a spell, direction is an object containing x and y that has to be between 1 and -1, func_modifier is the strength

    what.subspells.forEach(spell => {

        if (func_modifier >= 0) {
            spell.acceleration.x += direction.x * (1 + func_modifier)
            spell.acceleration.y += direction.y * (1 + func_modifier)
        }

        else if (func_modifier < 0) {
            spell.acceleration.x += direction.x / (1 - func_modifier)
            spell.acceleration.y += direction.y / (1 - func_modifier)
        }

    })
    return what
}

function Split_Number(what, func_modifier = 2) { //what is a spell, func_modifier is how many parts to split into

    const spell_lists = []
    const step = Math.Floor(what.subspells.length / func_modifier)
    let slice

    for (let i = 1; i < func_modifier; i++) {
        slice = what.subspells.slice(step * (i-1), step * i)

        slice[0].subspells = slice
        spell_lists.push(slice[0])
    }

    slice = what.subspells.slice(step * (func_modifier - 1), what.subspells.length)

    slice[0].subspells = slice
    spell_lists.push(slice[0])

    return spell_lists
}

function Split_Element(what, element) {//what is a spell, element is to divide all elements into their own separate spells

    const separate_list = what.subspells.filter((spell) => spell.spelltype == element)
    const separate_spell = separate_list[0]
    separate_spell.subspells = separate_list

    separate_list.forEach(spell => {
        
        what.subspells.splice(what.subspells.indexOf(spell), 1)
    });
    
    return [what, separate_spell]
}

function Combine(...whats) { //combines multiple spells into one

    let first = whats[0]

    whats.forEach(what => {
        
        if (first != what)
            first.subspells.push(what)
    });

    return first
}


/**TODO
 * move according to rotation (left, right in my POV) 
 */