import {User} from "../domain/model/user.entity.js";
import {extractCollection} from "../../shared/infrastructure/response.util.js";

/**
 * Maps IAM user resources into domain entities. Credentials are never copied into the entity.
 *
 * @class UserAssembler
 */
export class UserAssembler {
    /**
     * @param {Object} resource - User resource payload.
     * @returns {User} User entity.
     */
    static toEntityFromResource(resource) {
        // eslint-disable-next-line no-unused-vars
        const {password, ...safeResource} = resource;
        return new User({...safeResource});
    }

    /**
     * @param {import('axios').AxiosResponse} response - HTTP response containing user resources.
     * @returns {User[]} Collection of user entities.
     */
    static toEntitiesFromResponse(response) {
        return extractCollection(response, 'users').map(resource => this.toEntityFromResource(resource));
    }

    /**
     * @param {import('../domain/model/sign-up.command.js').SignUpCommand} command - Sign-up command.
     * @returns {Object} Resource payload for the users collection.
     */
    static toResourceFromSignUpCommand(command) {
        return {...command, createdAt: new Date().toISOString()};
    }
}
