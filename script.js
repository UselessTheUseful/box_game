const menu = $("#main_menu");

const message = $("#message_screen")
const play_again_button = $("#play_again_button")
const to_menu_button = $("#to_menu_button")
to_menu_button.click(main_menu);

const message_text = $("#message_text")

const obstacles_number_button = $("#obstacles_number_button")

const play_button = $("#play_button");
play_button.click(game_start); 

const obstacles = [$(".obstacle:first")];

const win = $("#win");
win.css({"top": "100px", "left": "140px"});

// create player box
const box = $("#box");
box.css("background-color", "red");
box.css("position", "absolute");
box.css({"top": "0px", "left": "0px"});

// set to "paused" to stop player from moving
let game_state

// creates an array of coordinates where obstacles can go (remember to multiply coordinates by 20 before using)
let obstacle_map = []
for (let x = 1; x < 7; x++) {
    for (let y = 0; y < 6; y++) {
        obstacle_map.push([x, y])
    }
}

// moves player and checks collision on new location
const move = {
    up() {
        box.css("top", "-=20px");
        collision_check();
    },
    down() {
        box.css("top", "+=20px");
        collision_check();
    },
    left() {
        box.css("left", "-=20px");
        collision_check();
    },
    right() {
        box.css("left", "+=20px");
        collision_check();
    },
};

// associate keys with effects
const key_action = {
    w: move.up,
    s: move.down,
    a: move.left,
    d: move.right
};

const input_checker = (event) => {  // used to handle key presses
    // checks if game is paused
    if (game_state == "paused") return;

    // checks if key is being held down
    if (event.repeat) return;

    // checks if key has associated action
    if (!(event.key in key_action)) return;

    // fire effect associated with pressed key
    key_action[event.key]()
};

function main_menu() {  // moves to main menu
    // stop player movement
    game_state = "paused";

    // hide game elements
    box.hide();
    obstacles.forEach(
       item => item.hide()
    );
    win.hide();
    message.hide();

    // display menu elements
    menu.show();
}

function game_start() { // starts a new game
    // hide menu
    menu.hide();

    // allow player movement
    game_state = "active";

    // set the correct number of obstacles
    obstacles_reset();
    if (obstacles_number_button.val() > 1) {
        for (i = 1; i < obstacles_number_button.val(); i++) {
            add_obstacle()
        }
    }

    // move game elements into place
    game_reset();

    box.show();
    obstacles.forEach(
       item => item.show()
    );
    win.show();
}

function collision_check() {    // check player collision
    // if player touching win box, victory
    if (win.position().top == box.position().top && win.position().left == box.position().left) {
        victory();
    }

    // if player touching obstacle, defeat
    for (let i in obstacles) {
        if (obstacles[i].position().top == box.position().top && obstacles[i].position().left == box.position().left) {
            defeat("Collision");
        }
    }

    // if player out of bounds, defeat
    if (box.position().top < 0 || box.position().top > 100) {
        defeat("Out of bounds");
    }
    if (box.position().left < 0 || box.position().left > 140) {
        defeat("Out of bounds");
    }
}

function player_reset() {   // move player to start and allow player movement
    box.stop();
    box.fadeOut("fast", () => box.css({"top": "0px", "left": "0px"}).fadeIn(() => game_state = "active"));
}

function game_reset() { // reset position of game elements
    // move player to start
    player_reset();

    // move obstacles into random unique location on game map
    my_shuffle(obstacle_map);
    for (let i in obstacles) {
        obstacles[i].css({"top": `${obstacle_map[i][1]*20}px`, "left": `${obstacle_map[i][0]*20}px`})
    }
}

function victory() {    // handles victory events
    // stop player movement
    game_state = "paused";

    // display message screen with victory text
    message_text.text("Victory!");
    message.fadeIn();

    // update score and high score
    let score = obstacles.length;

    if (localStorage.getItem("high_score")==null) {
        localStorage.setItem("high_score", score);
        $("#high_score").text(score)
    }
    
    let high_score = localStorage.getItem("high_score");
    
    $("#score").text(score);

    if (score > high_score) {
        localStorage.setItem("high_score", score);
        $("#high_score").text(score)
    }

    add_obstacle();

    // make play_again_button move player to next level
    play_again_button.click( () => {
        game_reset();
        message.hide();
        play_again_button.off();
    });
}

function defeat(text) { // handles defeat events
    // defeat animation
    box.animate({top: '-20px'});
    box.animate({top: '1000px'});

    // stop player movement
    game_state = "paused";

    // display message screen with defeat text
    // text is given in collision_check based on what caused defeat
    message_text.text(text);
    message.fadeIn();

    // make play_again_button restart
    play_again_button.click( () => {
        player_reset();
        message.hide();
        play_again_button.off();
    });
}

function add_obstacle() {   // create a new obstacle and add it to the map
    obstacles.push(
        obstacles[0].clone()
    );
    obstacles[obstacles.length-1].appendTo($("#map"));
}

function obstacles_reset() {    // reset obstacle count to 1
    i = obstacles.length - 1
    while (i > 0) {
        i--
        obstacles.pop()
    }
}

function my_shuffle(array) { // shuffles given array
    let y, z;
    let i = array.length;

    while (i > 0) {
        y = Math.floor((Math.random() * i));
        i--;
        z = array[i];
        array[i] = array[y];
        array[y] = z;
    }
}

// initiate the game
$("body").keydown(input_checker)

$(document).ready(main_menu());
if (localStorage.getItem("high_score")!==null) {
    $("#high_score").text(localStorage.getItem("high_score"));
}
