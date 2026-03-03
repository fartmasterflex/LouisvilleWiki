// --- js/bingo.js ---
import { openModal } from './utils.js';

const defaultBingoItems = [
    // === FOOD & DRINK ===
    "Drink Malört at Mag Bar",
    "Eat a Hot Brown",
    "Drink a bourbon neat",
    "Wait in line at Nord's Bakery",
    "Eat a Modjeska candy from Muth's",
    "Get Spinelli's out of someone's car",
    "Try a Benedictine spread sandwich",
    "Eat fried fish from a church fish fry",
    "Double fist bourbons on Whiskey Row",
    "Eat a Derby Pie (don't say the name, it's trademarked)",
    "Drink a Mint Julep unironically",
    "Eat burgoo and pretend to like it",
    "Get Indi's Chicken at midnight",
    "Argue about who has the best pizza",
    "Eat a gas station egg roll on Preston",
    "Have brunch at a place with a 90-minute wait",
    "Drink a beer at Against the Grain",
    "Order the wrong thing at an Ethiopian restaurant",
    "Eat a banana from the Banana Lady",

    // === LANDMARKS & SIGHTINGS ===
    "See the 21c David Statue",
    "Walk the Big Four Bridge",
    "Get lost in Cave Hill Cemetery",
    "See the giant bat on Slugger Museum",
    "Take a photo at the Louisville sign",
    "Visit Waverly Hills and survive",
    "See a riverboat on the Ohio",
    "Find a hidden speakeasy",
    "Find a historic plaque you've never noticed",
    "See the Witch's Tree on 6th & Park",
    "Stand inside the Water Tower",
    "Drive past Churchill Downs on a non-race day",
    "Visit the Thomas Edison House",
    "Find the Castleman statue pedestal",
    "Walk through St. James Court",

    // === ONLY IN LOUISVILLE MOMENTS ===
    "Hear someone say 'Keep Louisville Weird'",
    "Stuck behind a train in Germantown",
    "Survive the Watterson Expressway",
    "Smell the Butchertown plant",
    "Someone mentions Jack Harlow",
    "Spot a UofL/UK divided house flag",
    "See a Heine Bros coffee cup in the wild",
    "Fleur-de-lis tattoo spotted on a stranger",
    "Avoid an electric scooter on the sidewalk",
    "Hear a heated Cards vs. Cats argument",
    "See someone walk a very unusual pet",
    "Find a couch on someone's front porch",
    "See a car with a 502 bumper sticker",
    "Spot a 'Louisville is for Lovers' sticker",
    "Pass a house with a giant skeleton year-round",
    "Witness a thunderstorm appear from nowhere",
    "Get stuck at the train tracks on Lexington Rd",
    "See a horse where there shouldn't be one",

    // === CULTURE & ACTIVITIES ===
    "Go to a basement show",
    "See live music at Zanzabar",
    "Talk about Derby in November",
    "Play Dainty in Schnitzelburg",
    "Take a shot at The Back Door",
    "Watch a roller derby bout",
    "See Shakespeare in the Park for free",
    "Take a ghost tour of Old Louisville",
    "Go to an art hop in NuLu",
    "Bowl at Vernon Lanes",
    "Kayak on Floyds Fork",
    "Attend a Forecastle or Louder Than Life",
    "Buy a record at Guestroom",
    "Read a LEO Weekly cover-to-cover",
    "Attend a First Friday Trolley Hop",
    "Pet a dog at a brewery taproom",
    "Watch the sunset from the Big Four Bridge",
    "See Thunder Over Louisville live"
];

export function openBingo() {
    generateBingo();
    openModal('bingoModal');
}

function getBingoPool() {
    const custom = JSON.parse(localStorage.getItem('userBingo')) || [];
    return [...defaultBingoItems, ...custom];
}

export function generateBingo() {
    const board = document.getElementById('bingoBoard');
    board.innerHTML = '';

    let pool = getBingoPool().sort(() => 0.5 - Math.random());
    while (pool.length < 24) pool.push("Drink Bourbon");

    const selected = pool.slice(0, 24);
    selected.splice(12, 0, "FREE SPACE\n(Local Weirdo)");

    selected.forEach((text, i) => {
        const cell = document.createElement('div');
        cell.className = 'bingo-cell' + (i === 12 ? ' free stamped' : '');
        cell.innerText = text;
        if (i !== 12) {
            cell.onclick = () => cell.classList.toggle('stamped');
        }
        board.appendChild(cell);
    });
}

export function addBingoItem() {
    const input = document.getElementById('customBingoInput');
    const val = input.value.trim();
    if (val.length > 0) {
        let custom = JSON.parse(localStorage.getItem('userBingo')) || [];
        custom.push(val);
        localStorage.setItem('userBingo', JSON.stringify(custom));
        input.value = '';
        generateBingo();
    }
}

export function resetCustomBingo() {
    if (confirm("Clear your custom bingo squares?")) {
        localStorage.removeItem('userBingo');
        generateBingo();
    }
}

window.openBingo = openBingo;
window.generateBingo = generateBingo;
window.addBingoItem = addBingoItem;
window.resetCustomBingo = resetCustomBingo;
