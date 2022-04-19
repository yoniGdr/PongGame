/**
  A mobile is defined by its coordinates, an image and a "speed" defined by horizontal and vertical shift values
*/
export default class Mobile {

    /**
     * Buils a Mobile
     * @param  {number} x          the x coordinate of this mobile
     * @param  {number} y          the y coordinate of this mobile
     * @param  {string} imgSrc     this mobile's image src
     * @param  {number} shiftX = 0 the horizontal shift "speed"
     * @param  {number} shiftY = 0 the vertical shift "speed"
     */
    constructor(x, y, imgSrc, shiftX = 0, shiftY = 0) {
        this._y = y;
        this._x = x;
        this.img = new Image();
        this.img.src = imgSrc;
        this._shiftX = shiftX;
        this._shiftY = shiftY;
    }

    /**
     * Getter for width
     * @return {number} the width
     */
    get width() {
        return this.img.width;
    }

    /**
     * Getter for height
     * @return {number} the width
     */
    get height() {
        return this.img.height;
    }
    /** Method that moves this mobile 
     * @return {void} Nothing
     * */
    move() {
        this.x = this.x + this.shiftX;
        this.y = this.y + this.shiftY;
    }

    /**
     * Getter for y coordinate
     * @return {number} the y coordinate
     */
    get y() {
        return this._y;
    }

    /**
     * Getter for y coordinate
     * @return {number} the y coordinate
     */
    get x() {
        return this._x;
    }

    /**
     * Getter for x speed
     * @return {number} the x speed
     */
    get shiftX() {
        return this._shiftX;
    }

    /**
     * Getter for y speed
     * @return {number} the y speed
     */
    get shiftY() {
        return this._shiftY;
    }

    /**
     * Setter for x coordinate
     * @param {number} the x coordinate
     * @return {void} Nothing
     */
    set x(xx) {
        this._x = xx;
    }

    /**
     * Setter for y coordinate
     * @param {number} the y coordinate
     * @return {void} Nothing
     */
    set y(yy) {
        this._y = yy;
    }

    /**
     * Getter for y speed
     * @param {number} the y speed
     * @return {void} Nothing
     */
    set shiftY(shiftYY) {
        this._shiftY = shiftYY;
    }
   
    /**
     * Getter for x speed
     * @param {number} the x speed
     * @return {void} Nothing
     */
    set shiftX(shiftXX) {
        this._shiftX = shiftXX;
    }

    /** Draws this mobile's image at its coordinates in the given context
     * @param {CanvasRenderingContext2D} ctxt - the drawing context
     * @return {void} Nothing
     */
    draw(ctxt) {
        ctxt.drawImage(this.img, this.x, this.y);
    }

    /** Method that stops this mobile stops moving : speed becomes 0 
     * @return {void} Nothing
     */
    stopMoving() {
        this.shiftX = 0;
        this.shiftY = 0;
    }

    /**
     * Method that changes the mobile image
     * @param {object} The img path
     * @return {void} Nothing
     */
    changeImg(newSrc){
        this.img.src = newSrc;
    }
}
