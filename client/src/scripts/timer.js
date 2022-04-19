import Game from "./Game.js";

/**
 * A Timer
 */
export default class Timer {


    /**
     * Builds a Timer
     * @param {object} theGame - The game
     * @param {minutes} minutes - The minutes
     */
    constructor(theGame, minutes) {

        this.totalSeconds = minutes * 60;
        this.timer;

        this.isOn = false;

        this.theGame = theGame;
    }

    /**
     * Method that starts/pauses the timer
     * @return {void} Nothing
     */
    startPauseTimer() {
        this.isOn ? this.pauseTimer() : this.start();
    }

    /**
     * Getter for minutes
     * @return {number} the minutes
     */
    getMinutes() {
        return Math.floor(this.totalSeconds / 60); // Gets quotient rounded down
    }

    /**
     * Getter for seconds
     * @return {number} the seconds
     */
    getSeconds() {
        let seconds = this.totalSeconds % 60; // Gets remainder after division
        return seconds < 10 ? "0" + seconds : seconds; // Inserts "0" if needed
    }

    /**
     * Method that starts the timer
     * @return {void} Nothing
     */
    start() {
        this.isOn = true;
        this.runTimer();
    }
    /**
     * Method updates the timer by calling tick()
     * @return {void} Nothing
     */
    runTimer() {
        // calls `tick` every 1000 milliseconds

        this.timer = setInterval(() => {
            this.theGame.updateTimer(this.getMinutes() + ":" + this.getSeconds());
            if (this.tick()) {
                this.theGame.gameOver();
                clearInterval(this.timer);
            }
        }, 1000);
    }

   
    /**
     * Method that checks if the timer is over
     * @return {bool} True if yes False if not
     */
    tick() {
        if (this.totalSeconds > 0) {
            this.totalSeconds--; // Decreases total seconds by one
            return false;
        } else {
            return true;
        }
    }

    /**
     * Method that pauses the timer
     * @return {void} Nothing
     */
    pauseTimer() {
        this.isOn = false;
        // Stops calling `tick` and toggles buttons
        clearInterval(this.timer);
    }
}
