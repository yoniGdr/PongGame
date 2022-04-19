import Ball from "./Ball.js";
import FireBall from "./FireBall.js";
import Paddle from "./Paddle.js";
import Timer from "./timer.js";
const PADDLE_BLUE_IMAGE_SRC = "./images/paddle_blue.png";
const PADDLE_RED_IMAGE_SRC = "./images/paddle_red.png";

/**
 * The Pong game
 */
export default class Game {
    /**
     * Builds a Game
     * @param  {Canvas} canvas the canvas of the game
     */
    constructor(canvas) {
        this.raf = null;
        this._canvas = canvas;
        this.ball = new Ball(
            this.canvas.width - 80,
            this.canvas.height / 2,
            this
        );
        this.ball.newRound();
        this.ball.x = this._canvas.width - 80;
        this.ball.y = this._canvas.height / 2 + this.ball.height / 2;
        this.paddleA = new Paddle(
            this.canvas.width - 50,
            this.canvas.height / 2 - 20,
            this
        );
        this.paddleB = new Paddle(50 - 22, this.canvas.height / 2 - 20, this);
        this.gameOn = false;
        this.scoreA = 0;
        this.scoreB = 0;
        this.player = {
            user: localStorage.getItem("pong_username"),
            roomId: null,
            socketId: null,
            isPlayer1: true,
            paddle: null,
        };
        this.socket = null;
        this.handleConnection();
        this.handleMovement();
        this.shadowDelay = 0;
        this.hotRoundFrame = 0;
        this.justAddedPoints = false;

        this.timer = new Timer(this, 1);
        this.gameFinished = false;
        this.canPlay = false;
        this.canStart = false;

        this.messages = document.getElementById("messages");
        this.waiting = document.getElementById("players");
        this.form = document.getElementById("form");
        this.input = document.getElementById("input");
        this.nextPlayer = null;
    }

    /**
     * Getter for gameOn (true when the game is On, false if not)
     * @return {bool} The status of the game
     */
    gameStatus() {
        return this.gameOn;
    }

    /**
     * Method that updates the time
     * @return {object} The html object of the timer
     * @return {void} Nothing
     */
    updateTimer(time) {
        document.getElementById("timer").innerText = time;
    }

    /**
     * Method that triggers all the needed fonctions when the game is over.
     * @return {void} Nothing
     */
    gameOver() {
        this.gameFinished = true;

        const ctxt = this.canvas.getContext("2d");
        ctxt.font = "100px Gameria";
        ctxt.textAlign = "center";
        ctxt.fillStyle = "#ef5b5b";
        if (this.scoreA == this.scoreB) {
            ctxt.fillStyle = "#FFD700";
            ctxt.fillText(
                "DRAW",
                this.canvas.width / 2,
                this.canvas.height / 2
            );
            ctxt.fillStyle = "black";
            ctxt.font = "50px Gameria";
            ctxt.fillText(
                "Click anywhere to play again",
                this.canvas.width / 2,
                this.canvas.height - 50
            );
            this.socket.emit("draw");
            window.cancelAnimationFrame(this.raf);
            return;
        }
        if (this.scoreA > this.scoreB) {
            if (this.player.isPlayer1) {
                ctxt.fillStyle = "#29a5ed";
                ctxt.fillText(
                    "YOU WIN",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
            } else {
                ctxt.fillText(
                    "YOU LOSE",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
                this.socket.on("leave", () => {
                    window.location.replace("out.html");
                });
            }
        } else {
            if (!this.player.isPlayer1) {
                ctxt.fillStyle = "#29a5ed";
                ctxt.fillText(
                    "YOU WIN",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
            } else {
                ctxt.fillText(
                    "YOU LOSE",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
                this.socket.on("leave", () => {
                    window.location.replace("out.html");
                });
            }
        }

        this.socket.emit("gameOver");

        ctxt.fillStyle = "black";
        ctxt.font = "50px Gameria";

        if (this.nextPlayer != null) {
            ctxt.fillText(
                "Click anywhere to play against",
                this.canvas.width / 2,
                this.canvas.height - 60
            );
            ctxt.fillStyle = "#ef5b5b";
            ctxt.fillText(
                this.nextPlayer,
                this.canvas.width / 2,
                this.canvas.height - 20
            );
        } else {
            ctxt.fillText(
                "Click anywhere to play again",
                this.canvas.width / 2,
                this.canvas.height - 50
            );
        }
        window.cancelAnimationFrame(this.raf);
    }

    /**
     * Method that allows the player to play again
     * @return {void} Nothing
     */
    playAgain() {
        if (this.gameFinished) {
            location.reload();
        }
    }

    /**
     * Getter for the canvas
     * @return {object} The canvas
     */
    get canvas() {
        return this._canvas;
    }

    /**
     * Method that adds the score and sends the ball to loser player.
     * @param {bool} isPlayer1 - Is the Player 1
     * @return {void} Nothing
     */
    roundWinner(isPlayer1) {
        if (this.justAddedPoints) return;
        this.justAddedPoints = true;
        this.shadowDelay = 2;
        this.ball.shiftY = 0;
        if (isPlayer1) {
            this.scoreA++;
            this.ball.shiftX = 6;
            this.canvas.style.boxShadow = this.player.isPlayer1
                ? "5px 5px 30px #00cc66"
                : "5px 5px 30px #e60000";
        } else {
            this.ball.shiftX = -6;
            this.scoreB++;
            this.canvas.style.boxShadow = !this.player.isPlayer1
                ? "5px 5px 30px #00cc66"
                : "5px 5px 30px #e60000";
        }
        this.paddleA.y = this.canvas.height / 2 - 20;
        this.paddleB.y = this.canvas.height / 2 - 20;
        this.ball = new Ball(this.ball.x, this.ball.y, this);
        this.ball.newRound();
        this.hotRoundFrame = 0;
        const myInterval = setInterval(() => {
            this.shadowDelay--;
            if (this.shadowDelay <= 0) {
                this.justAddedPoints = false;
                this.canvas.style.boxShadow = "";
                clearInterval(myInterval);
            }
        }, 1000);
    }

    /**
     * Method emits the end of a round
     * @param {bool} isPlayer1 - Is the Player 1
     * @return {void} Nothing
     */
    emitRoundWinner(isPlayer1) {
        this.socket.emit("roundWinner event", isPlayer1);
    }

    /**
     * Starts the game
     * @return {void} Nothing
     */
    start() {
        if (this.gameFinished) return;
        this.gameOn = true;
        this.animate();
    }

    /**
     * Stops the game, including the animations
     * @return {void} Nothing
     */
    stop() {
        if (this.gameFinished) return;
        this.gameOn = false;
        const ctxt = this.canvas.getContext("2d");
        ctxt.fillText(
            "GAME PAUSED",
            this.canvas.width / 2,
            this.canvas.height / 2
        );
        window.cancelAnimationFrame(this.raf);
    }

    /**
     * Animates the game
     * @return {void} Nothing
     */
    animate() {
        this.moveAndDraw();
        this.raf = window.requestAnimationFrame(this.animate.bind(this));
        this.hotRoundFrame++;

        if (this.hotRoundFrame == 700) {
            this.canvas.style.boxShadow = "inset 5px 5px 30px #FFA500";
            this.ball = new FireBall(
                this.ball.x,
                this.ball.y,
                this,
                this.ball.shiftX,
                this.ball.shiftY
            );
        }

        const ctxt = this.canvas.getContext("2d");
        ctxt.fillStyle = "black";
        ctxt.font = "50px Gameria";
        ctxt.fillText(
            `${this.scoreB} - ${this.scoreA}`,
            this.canvas.width / 2,
            50
        );
    }

    /**
     * Moves then draws on the canvas
     * @return {void} Nothing
     */
    moveAndDraw() {
        const ctxt = this.canvas.getContext("2d");
        ctxt.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ball.move();
        this.ball.collision(this.paddleA);
        this.ball.collision(this.paddleB);
        this.ball.draw(ctxt);
        this.paddleA.move(this.canvas);
        this.paddleB.move(this.canvas);
        this.paddleA.draw(ctxt);
        this.paddleB.draw(ctxt);
    }

    /**
     * Starts or Pauses the game.
     * @return {void} Nothing
     */
    startPause() {
        if (!this.canPlay) return;
        if (this.gameOn) {
            this.stop();
            this.timer.startPauseTimer();
            document.getElementById("start").value = "jouer";
        } else {
            this.start();
            this.timer.startPauseTimer();
            document.getElementById("start").value = "stop";
        }
    }

    /**
     * Method that handles the movement/options when a key is pressed down
     * @param {event} event key
     * @return {void} Nothing
     */
    keyDownActionHandler(event) {
        switch (event.key) {
            case "Escape":
                this.socket.emit("start");
                break;
            case " ":
                if (!this.canPlay && this.canStart) {
                    this.socket.emit("ballSent event");
                    this.canPlay = true;
                }
                break;
            case "ArrowUp":
            case "Up":
                this.socket.emit("up", this.player.isPlayer1);
                this.player.paddle.moveUp();
                break;
            case "ArrowDown":
            case "Down":
                this.socket.emit("down", this.player.isPlayer1);
                this.player.paddle.moveDown();
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    /**
     * Method that handles the movement when a key is not pressed anymore
     * @param {event} event key
     * @return {void} Nothing
     */
    keyUpActionHandler(event) {
        switch (event.key) {
            case "ArrowUp":
            case "Up":
                this.socket.emit(
                    "stop",
                    this.player.isPlayer1,
                    this.player.paddle.x,
                    this.player.paddle.y
                );
                this.player.paddle.stopMoving();
                break;
            case "ArrowDown":
            case "Down":
                this.socket.emit(
                    "stop",
                    this.player.isPlayer1,
                    this.player.paddle.x,
                    this.player.paddle.y
                );
                this.player.paddle.stopMoving();
                break;
            default:
                return;
        }
        event.preventDefault();
    }

    /**
     * Method that handles the connection
     * @return {void} Nothing
     */
    handleConnection() {
        this.socket = io();
        this.socket.on("connection", () => {
            this.socket.emit("joinPrivate");
        });

        this.socket.on("canPlay", () => {
            this.canPlay = true;
            if (this.player.isPlayer1) this.socket.emit("start");
        });
        this.socket.on("startGame", () => {
            this.startPause();
        });
        this.socket.on("update_list", (thePlayers) => {
            this.waiting.innerText = "";
            let item = null;
            const arrayLength = thePlayers.length;
            this.nextPlayer = arrayLength >= 1 ? thePlayers[0] : null;
            for (let i = 0; i < arrayLength; i++) {
                item = document.createElement("li");
                item.innerText = thePlayers[i];
                this.waiting.appendChild(item);
            }
        });
        this.socket.on("yourTurn", () => {
            location.reload();
        });
        this.socket.on("connection_refused", () => {
            const ctxt = this.canvas.getContext("2d");
            ctxt.font = "40px Gameria";
            ctxt.textAlign = "center";
            ctxt.fillText(
                "Oups, a game has already started.",
                this.canvas.width / 2,
                this.canvas.height / 2
            );
            ctxt.font = "30px Gameria";
            ctxt.fillText(
                "Wait until it's over.",
                this.canvas.width / 2,
                this.canvas.height / 2 + 50
            );
            this.socket.emit("joinWaiting", this.player.user);
        });

        this.socket.on("private", (isPlayer1) => {
            if (isPlayer1) {
                this.paddleA.changeImg(PADDLE_BLUE_IMAGE_SRC);
                this.paddleB.changeImg(PADDLE_RED_IMAGE_SRC);
                this.player.socketId = this.socket.id;
                this.player.paddle = this.paddleA;
                this.player.isPlayer1 = true;
                console.log("You are the Player 1");
                document.getElementById("player").innerText = this.player.user;
                const ctxt = this.canvas.getContext("2d");
                ctxt.font = "40px Gameria";
                ctxt.textAlign = "center";
                ctxt.fillText(
                    "Waiting for Player 2",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
                this.socket.on("canStart", (user) => {
                    if (this.gameFinished) return;
                    this.moveAndDraw();
                    this.canStart = true;
                    ctxt.font = "40px Gameria";
                    ctxt.fillStyle = "#ef5b5b";
                    ctxt.fillText(
                        user,
                        this.canvas.width / 2,
                        this.canvas.height / 2
                    );
                    ctxt.fillStyle = "black";
                    ctxt.fillText(
                        "joined the game",
                        this.canvas.width / 2,
                        this.canvas.height / 2 + 50
                    );
                    ctxt.fillText(
                        "Press space to send the ball",
                        this.canvas.width / 2,
                        this.canvas.height - 100
                    );
                });
            } else {
                const ctxt = this.canvas.getContext("2d");
                ctxt.font = "40px Gameria";
                ctxt.textAlign = "center";
                this.paddleB.changeImg(PADDLE_BLUE_IMAGE_SRC);
                this.paddleA.changeImg(PADDLE_RED_IMAGE_SRC);
                this.player.paddle = this.paddleB;
                this.player.isPlayer1 = false;
                this.player.socketId = this.socket.id;
                console.log("You are the Player 2");
                document.getElementById("player").innerText = this.player.user;
                this.moveAndDraw();
                ctxt.textAlign = "center";
                ctxt.fillText(
                    "Waiting for Player 1 to send the ball",
                    this.canvas.width / 2,
                    this.canvas.height / 2
                );
                this.socket.emit("canStart event", this.player.user);
            }
        });
        this.socket.on("alone", () => {
            location.reload();
        });
        this.socket.on("roundWinner", (numPaddle) => {
            this.roundWinner(numPaddle);
        });
        document.getElementById("form").addEventListener("submit", (e) => {
            e.preventDefault();
            if (this.input.value) {
                this.socket.emit(
                    "chat message",
                    this.player.user + " : " + this.input.value,
                    this.player.socketId
                );
                this.input.value = "";
            }
        });
        this.socket.on("chat message", (msg, socketId) => {
            const item = document.createElement("li");
            if (socketId == this.player.socketId) {
                item.style.color = "#29a5ed";
                item.textContent = msg;
            } else {
                item.style.color = "#ef5b5b";
                item.textContent = msg;
            }
            this.messages.appendChild(item);
        });
    }

    /**
     * Method that handles the movement
     * @return {void} Nothing
     */
    handleMovement() {
        this.socket.on("paddleUp", (isPlayer1) => {
            if (!isPlayer1 && this.player.isPlayer1) {
                this.paddleB.moveUp();
            }
            if (isPlayer1 && !this.player.isPlayer1) {
                this.paddleA.moveUp();
            }
        });
        this.socket.on("paddleDown", (isPlayer1) => {
            if (!isPlayer1 && this.player.isPlayer1) {
                this.paddleB.moveDown();
            }
            if (isPlayer1 && !this.player.isPlayer1) {
                this.paddleA.moveDown();
            }
        });
        this.socket.on("paddleStop", (isPlayer1, x, y) => {
            if (!isPlayer1 && this.player.isPlayer1) {
                this.paddleB.stopMoving();
                this.paddleB.x = x;
                this.paddleB.y = y;
            }
            if (isPlayer1 && !this.player.isPlayer1) {
                this.paddleA.stopMoving();
                this.paddleA.x = x;
                this.paddleA.y = y;
            }
        });
        this.socket.on("ballMoved", (ballX, ballY, ballShiftX, ballShiftY) => {
            this.ball.x = ballX;
            this.ball.y = ballY;
            this.ball.shiftX = ballShiftX;
            this.ball.shiftY = ballShiftY;
        });
    }

    /**
     * Method that handles the ball collision
     * @param {number} ballX - The x position
     * @param {number} ballY - The y position
     * @param {number} ballShiftX - The x's speed
     * @param {number} ballShiftY - The y's speed
     * @return {void} Nothing
     */
    handleBallCollision(ballX, ballY, ballShiftX, ballShiftY) {
        this.socket.emit("ball", ballX, ballY, ballShiftX, ballShiftY);
    }
}
