import {CONSTANTS} from "../constants/constants"

export class ValidationError extends Error{
    constructor(message: string){
        super(message);
        this.name = CONSTANTS.ERRORS.VALIDATION;
    }
}