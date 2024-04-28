export type User = {
    username: string;
    firstName: string;
    lastName: string;
    dob: Date;
    password?: string;
    email: string;
    affiliation: string;
    profileUrl?: string;
}