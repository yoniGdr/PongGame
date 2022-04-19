import Mobile from "./Mobile.js";

// default values for a Ball : image and shifts
const BALL_IMAGE_SRC = "./images/balle24.png";
const SHIFT_X = -8;
const SHIFT_Y = 0;
const SPEED = 12;
/**
 * a Ball is a mobile with a ball as image and that bounces in a Game (inside the game's canvas)
 */
export default class Ball extends Mobile {
    
    /**Builds a ball
     * @param  {number} x       the x coordinate
     * @param  {number} y       the y coordinate
     * @param  {Game} theGame   the Game this ball belongs to
     */
    constructor(x, y, theGame,shiftX=SHIFT_X,shiftY=SHIFT_Y,src=BALL_IMAGE_SRC,speed=SPEED) {
        super(x, y, src, shiftX, shiftY);
        this.theGame = theGame;
        this.speed = speed; 
    }

    

    /**
     * When moving a ball, it bounces inside the limit of its game's canvas
     * @return {void} Nothing
     */
    move() {
        if (this.y <= 0 || this.y + this.height >= this.theGame.canvas.height) {
            this.shiftY = -this.shiftY; 
        } else if (
            this.x <= 0
            
        ) {
            this.theGame.emitRoundWinner(true);
        } else if (this.x + this.width >= this.theGame.canvas.width) {
            this.theGame.emitRoundWinner(false);
        }
        super.move();
    }

    /** This method allows to know if a ball is in collision with a paddle
     * if it is the case the method returns True and False otherwise
     * @param {*} paddle a paddle
     * @return {void} Nothing
     */
    collision(paddle) {
        const max_x = Math.max(paddle.x, this.x);
        const max_y = Math.max(paddle.y, this.y);
        const x2 = paddle.x + paddle.width;
        const y2 = paddle.y + paddle.height;
        const min_x = Math.min(x2, this.x + this.width);
        const min_y = Math.min(y2, this.y + this.height);
        if (!(max_x < min_x && max_y < min_y)) {
            return;
        }

        if (this.shiftX > 0  &&  this.x+10 > paddle.x) return; 
        if (this.shiftX < 0  &&  this.x-10 < paddle.x) return; 

        /** To adjust the ball angle according to the impact point position :
         */
        const mid_ball = (this.y)  + this.height / 2;
        const mid_paddle = paddle.y + paddle.height / 2;
        const diff = -(mid_paddle - mid_ball);
        const seg = diff / (paddle.height / 10); /* 10 segments*/
        this.shiftY = seg;
        this.shiftX =
            this.shiftX > 0 ? -(this.speed - Math.abs(seg)) : this.speed - Math.abs(seg);

        /** ( Plus la diff entre la ball et le paddle est grande, plus seg sera grand.
         * donc plus la valeur absolue shiftY sera grande et plus celle de shiftX sera petite.
         * et donc plus l'angle du rebond va être important. )
         */

        this.theGame.handleBallCollision(
            this.x,
            this.y,
            this.shiftX,
            this.shiftY
        );
    }

    /**
     * Method that puts the ball in the middle for a new round.
     * @return {void} Nothing
     */
    newRound() {
        this.x = this.theGame.canvas.width / 2 + this.width / 2;
        this.y = this.theGame.canvas.height / 2 + this.height / 2;
    }
}
