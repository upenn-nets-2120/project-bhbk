export interface NewPost {
    contentUrl: string;
    caption: string;
    authorId: number;  
    createdAt?: Date;
    updatedAt?: Date;
    likes?: number[];  
}

export interface UpdatePost {
    contentUrl?: string;
    caption?: string;
    updatedAt?: Date;
}

