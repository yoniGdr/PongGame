"use strict";

import Game from "./Game.js";
import {closePopup, openPopup, resetSession} from "./settings.js"


const init = () => {
    const username_s = localStorage.getItem('pong_username');
    if(username_s==null){
        let username = prompt("Enter a username : ");
        while(username == null || username == ""){
            username = prompt("Enter a username : ");
        }
        localStorage.setItem('pong_username', username);
    }
    const theField = document.getElementById("field");
    const theGame = new Game(theField);


    theField.addEventListener('click', () => {
       theGame.playAgain();  
    }, false);

    document
        .getElementById("start")
        .addEventListener("click", () => startGame());
    window.addEventListener(
        "keydown",
        theGame.keyDownActionHandler.bind(theGame)
    );
    window.addEventListener("keyup", theGame.keyUpActionHandler.bind(theGame));

    // cette ligne sert a perdre le focus des boutons cliqués
    // ...

};

    const settings = document.getElementById("settings");
    const popUp = document.getElementById("popup");
    const close = document.getElementById("close");
    const reset = document.getElementById("reset");
    settings.addEventListener("click", () => {openPopup(popUp)});
    close.addEventListener("click", () => {closePopup(popUp)});
    reset.addEventListener("click", () => {resetSession()});
    window.addEventListener("load", init);

/** start and stop a game
 * @param {Game} theGame - the game to start and stop
 */
const startGame = () => {
        window.dispatchEvent(new KeyboardEvent('keydown', {'key': 'Escape'}));
};
