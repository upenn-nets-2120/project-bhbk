import bcrypt from 'bcrypt';

const saltRounds = 10;

export const encryptPassword = async (password: string) => {
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    return hashedPassword;
}

export const comparePassword = async (password: string, foundPassword: string) => {
    const isValidPassword = await bcrypt.compare(password, foundPassword);

    return isValidPassword
}