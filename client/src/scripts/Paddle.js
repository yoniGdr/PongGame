import Mobile from "./Mobile.js";
import MoveState from "./movestate";

// default values for a Paddle : image and shifts
const PADDLE_IMAGE_SRC = "./images/paddle.png";
const SHIFT_X = 0;
const SHIFT_Y = 6;

/**
 * a Paddle is a mobile with a paddle as image and that moves vertically in a Game (inside the game's canvas)
 */
export default class Paddle extends Mobile {

    /**  build a paddle
     * @param  {number} x       the x coordinate
     * @param  {number} y       the y coordinate
     * @param  {Game} theGame   the Game this ball belongs to
     */
    constructor(x, y, theGame) {
        super(x, y, PADDLE_IMAGE_SRC, SHIFT_X, SHIFT_Y);
        this.theGame = theGame;
        this.moving = MoveState.NONE;
        this.points = 0;
    }

    /**
     * Method that checks if the state of the movement is up. 
     * @return {bool} True if the mouvement is a up state 
     */
    up() {
        return this.moving === MoveState.UP;
    }
    /**
     * Method that checks if the state of the movement is down.
     * @return {bool} True if the mouvement is a down state 
     */
    down() {
        return this.moving === MoveState.DOWN;
    }
     /**
     * Method that gives the UP state to the movement 
     * @return {void} Nothing
     */
    moveUp() {
        this.shiftY = -Math.abs(this.shiftY);
        this.moving = MoveState.UP;
    }
     /**
     * Method that gives the DOWN state to the movement 
     * @return {void} Nothing
     */
    moveDown() {
        this.shiftY = Math.abs(this.shiftY);
        this.moving = MoveState.DOWN;
    }


    /**
     * method that manages the movement according to the state.
     * @param {canvas} canvas 
     * @return {void} Nothing
     */
    move(canvas) {
        if (this.up()) this.y = Math.max(0, this.y + this.shiftY);
        if (this.down())
            this.y = Math.min(
                canvas.height - (this.height),
                this.y + this.shiftY
            );
    }
    
    /**
     * Method that gives the NONE state to the movement.
     * @return {void} Nothing
     */
    stopMoving() {
        this.moving = MoveState.NONE;
    }
    
}
