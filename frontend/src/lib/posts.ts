export const extractHashtags = (text: string) => {
    const regex = /#(\w+)/g;


    const hashtagList: string[] = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        hashtagList.push(match[1]);
    }

    return hashtagList
}