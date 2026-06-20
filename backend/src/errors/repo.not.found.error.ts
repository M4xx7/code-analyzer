import { CONSTANTS } from "../constants/constants";

export class RepoNotFoundError extends Error{
    constructor(message: string){
        super(message);
        this.name = CONSTANTS.ERRORS.REPO_NOT_FOUND;
    }
}