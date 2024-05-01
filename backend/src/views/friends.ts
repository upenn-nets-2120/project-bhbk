export const addFriends = (userId: number, friendId: number) => {
    const existingFriendship = await db.select().from(userFriends)
    .where(eq(userFriends.userId, userId)
      .and(eq(userFriends.friendId, friendId)))
    .first();
}