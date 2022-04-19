import Ball from "./Ball.js";

// default values for a Ball : image and shifts
const FIRE_IMAGE_SRC = "./images/fire26-0.png";
const SHIFT_X = 4;
const SHIFT_Y = 0;
const SPEED = 16;

/**
 * a Fire Ball is a mobile with a ball as image and that bounces in a Game (inside the game's canvas)
 */
export default class FireBall extends Ball {

    /**  build a ball
     * @param  {number} x       the x coordinate
     * @param  {number} y       the y coordinate
     * @param  {Game} theGame   the Game this ball belongs to
     */
    constructor(x, y, theGame, shiftX = SHIFT_X, shiftY = SHIFT_Y) {
        super(x, y, theGame, shiftX, shiftY, FIRE_IMAGE_SRC, SPEED);
        this.frame = 0;
        setInterval(() => {
            this.nextFrame();
        }, 75);
    }

    
    /** Changes the fireball frame (img)
     * @return {void} Nothing
     */
    nextFrame() {
        this.frame++;
        this.changeImg(`./images/fire26-${this.frame % 16}.png`);
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

        if (this.shiftX > 0 && this.x + 10 > paddle.x) return;
        if (this.shiftX < 0 && this.x - 10 < paddle.x) return;
        /** To adjust the ball angle according to the impact point position :
         */
        /* -1 car l'image fait 25px d'hauteur*/
        const mid_ball = this.y - 1 + this.height / 2;
        const mid_paddle = paddle.y + paddle.height / 2;

        const diff = -(mid_paddle - mid_ball);
        const seg = diff / (paddle.height / 10); /* 10 segments*/
        this.shiftY = seg;
        this.shiftX =
            this.shiftX > 0
                ? -(this.speed - Math.abs(seg))
                : this.speed - Math.abs(seg);

        /** ( Plus la diff entre la ball et le paddle et grand, plus seg sera grand.
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
}
