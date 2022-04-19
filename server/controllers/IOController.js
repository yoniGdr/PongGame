const PRIVATE_ROOM = "private";
const WAITING_ROOM = "waiting";
export default class IOController {
    #io;
    #clients;
    #usernames;
    #playerOne;
    #playerTwo;
    #draw; // true if a game finished on a draw, else if not
    constructor(io) {
        this.#io = io;
        this.#usernames = new Map();
        this.#playerOne = null;
        this.#playerTwo = null;
        this.#clients = [];
        this.#draw = false;
    }

    /**
     * Method that registers a client by calling setupListeners()
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    registerSocket(socket) {
        if (this.#playerOne == null || this.#playerTwo == null) {
            socket.on("chat message", (msg, socketId) => {
                this.#io.to(PRIVATE_ROOM).emit("chat message", msg, socketId);
            });
            console.log(`New connection, id : ${socket.id}`);
            this.setupListeners(socket);
        } else {
            socket.emit(
                "connection_refused",
                `The room is full, wait until the other players finish the game.`
            );
            socket.on(`disconnect`, () => this.leaveWaiting(socket));
            socket.on("joinWaiting", (username) => {
                this.joinWaitingRoom(socket, username);
            });
        }
    }

    /**
     * Method that handles the connection of a client
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    setupListeners(socket) {
        if (this.#playerOne == null) {
            this.#playerOne = socket;
        } else {
            this.#playerTwo = socket;
        }
        // this.#clients.push(socket.id);
        socket.on(`disconnect`, () => this.leave(socket));
        socket.on(`joinPrivate`, () => this.joinPrivate(socket));
        socket.emit("connection");
        // socket.on(`joinWaiting`, () => this.joinWaitingRoom(socket));
    }

    /**
     * Method that inserts a client into PRIVATE_ROOM
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    joinPrivate(socket) {
        this.#draw = false;
        socket.join(PRIVATE_ROOM);
        socket.emit("private", this.#playerOne == socket);
        this.handleKeyAction(socket);
        socket.on("start", () => this.startGame());
        socket.on("canStart event", (user) =>
            this.#playerOne.emit("canStart", user)
        );

        socket.on("roundWinner event", (isPlayer1) =>
            this.syncRoundWinner(isPlayer1)
        );
        socket.on("ballSent event", () => {
            this.#io.to(PRIVATE_ROOM).emit("canPlay");
        });
        socket.on("ball", (x, y, shiftX, shiftY) =>
            this.syncBall(x, y, shiftX, shiftY)
        );
        socket.on("gameOver", () => {
            this.#playerOne = null;
            this.#playerTwo = null;
            // let i = 0;
            if (this.#clients.length >= 1){
                        this.#io.to(PRIVATE_ROOM).emit("leave");
                // const inter = setInterval(() => {
                //     if (i >= 2) {
                //         clearInterval(inter);
                //     }
                //     i++;
                // }, 1000);
            }

        });
        socket.on("draw", () => {
            this.#draw = true;
        });
    }

    /**
     * Broadcasts when a game starts
     * @return {void} Nothing
     */
    startGame() {
        this.#io.to(PRIVATE_ROOM).emit("startGame");
        console.log("Game started");
    }

    /**
     * Method that syncs the ball
     * @param {number} x - The x position
     * @param {number} y - The y position
     * @param {number} shiftX - The x's speed
     * @param {number} shiftY - The y's speed
     * @return {void} Nothing
     */
    syncBall(x, y, shiftX, shiftY) {
        this.#io.to(PRIVATE_ROOM).emit("ballMoved", x, y, shiftX, shiftY);
    }

    /**
     * Method that syncs the end of a round
     * @param {bool} isPlayer1 - Is Player One
     * @return {void} Nothing
     */
    syncRoundWinner(isPlayer1) {
        this.#io.to(PRIVATE_ROOM).emit("roundWinner", isPlayer1);
    }

    /**
     * Method that inserts a client into WAITING_ROOM
     * @param {object} socket - The socket
     * @param {string} username - The username
     * @return {void} Nothing
     */
    joinWaitingRoom(socket, username) {
        socket.join(WAITING_ROOM);
        // this.#io.to(PRIVATE_ROOM).emit("waiting");
        console.log(`${socket.id} joined the waiting room.`);
        this.#usernames.set(socket.id, username);
        this.#clients.push(socket);
        this.#io.to(PRIVATE_ROOM).emit("update_list", this.waitingList());
        this.#io.to(WAITING_ROOM).emit("update_list", this.waitingList());
    }

    /**
     * Method that handles the deconnection of a client from PRIVATE_ROOM
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    leave(socket) {
        if (this.#playerOne == socket) {
            this.#playerOne = null;
        } else if (this.#playerTwo == socket) {
            this.#playerTwo = null;
        }
        //if (this.#playerTwo == null && this.#playerOne == null)
            this.#io.to(PRIVATE_ROOM).emit("alone");
        console.log(`${socket.id} disconnected`);
        this.switchToPrivate();
        // this.#usernames.delete(socket.id);
    }

    /**
     * Method that handles the deconnection of a client from WAITING_ROOM
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    leaveWaiting(socket) {
        // socket.leave(WAITING_ROOM);
        this.#usernames.delete(socket.id);
        this.#clients.pop(socket);
        socket.broadcast.emit("update_list", this.waitingList());
        console.log(`${socket.id} disconnected`);
    }

    /**
     * Returns a list with the clients usernames
     * @return {array} - The usernames
     */
    waitingList() {
        let res = [];
        for (let [key, value] of this.#usernames) {
            res.push(value);
            // console.log(value);
        }
        return res;
    }

    /**
     * Switchs a client from WAITING_ROOM to PRIVATE_ROOM
     * @return {void} Nothing
     */
    switchToPrivate() {
        if (this.#draw) {
            this.#draw = false;
            return;
        }
        const clientSocket = this.#clients[0];
        if (clientSocket == null) {
            return;
        }
                // clientSocket.emit("yourTurn");
        let i = 0;
        const inter = setInterval(() => {
            if (i >= 1) {
                clearInterval(inter);
                clientSocket.emit("yourTurn");
            }
            i++;
        }, 1000);
    }

    /**
     * Handle the pressing of a key
     * @param {object} socket - The socket
     * @return {void} Nothing
     */
    handleKeyAction(socket) {
        socket.on("up", (isPlayer1) => {
            this.#io.to(PRIVATE_ROOM).emit("paddleUp", isPlayer1);
        });
        socket.on("down", (isPlayer1) => {
            this.#io.to(PRIVATE_ROOM).emit("paddleDown", isPlayer1);
        });
        socket.on("stop", (isPlayer1, x, y) => {
            this.#io.to(PRIVATE_ROOM).emit("paddleStop", isPlayer1, x, y);
        });
    }
}
