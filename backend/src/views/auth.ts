import { users } from "../database/schema";
import { db } from "../database/setup";
import { NewUser, SignUpUser } from "../types/user";
import { encryptPassword } from "../utils/encrypt";

export const createUser = async (user: SignUpUser) => {
    const { password, username, firstName, lastName, affiliation, email, dob, ...otherUserParams } = user;
    const { password: extractedPassword , ...userWithoutPassword } = user;

    const missingFields = !password || !username || !firstName || !lastName || !affiliation || !email || !dob;

    if (!missingFields) {
        throw new Error('Missing fields to sign up new user');
    }

    const hashedPassword = await encryptPassword(password);

    const newUser: NewUser = {
        hashedPassword,
        username,
        firstName,
        lastName,
        affiliation,
        email,
        dob,
        ...otherUserParams
    }

    await db.insert(users).values(newUser)

    return userWithoutPassword;
}