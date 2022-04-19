/**
 * class MoveState that represents all the possible states of a movement 
 */
export default class MoveState {
    static DOWN = 0;
    static UP = 1;
    static NONE = 2;
    get DOWN() {
        return DOWN;
    }
    get UP() {
        return UP;
    } 
    get NONE() {
        return NONE;
    }
}
