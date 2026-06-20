import { CONSTANTS } from "../constants/constants";

export class CloneError extends Error{
    constructor(message: string){
        super(message);
        this.name = CONSTANTS.ERRORS.CLONE;
    }
}