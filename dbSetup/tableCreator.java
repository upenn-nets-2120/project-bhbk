package dbSetup;

import java.sql.SQLException;

import dbSetup.mysql.DatabaseAccess;
import dbSetup.mysql.DatabaseManager;

public class tableCreator {

    private DatabaseAccess access = null;

    /**
     * Constructor: connect to the database. Do not modify this method.
     */
    public tableCreator() {
        System.out.println("---- Connect to MySQL -------");
        try {
            access = DatabaseManager.getDatabase();
            // logger.debug("Connected!");
        } catch (Exception e) {
            // logger.error("Error connecting to database: " + e.getMessage(), e);
        }
    }

    /**
     * Create the chat table on mysql. If it already exists, do nothing.
     *
     * @param connection DatabaseAccess: The connection to the database
     * @throws SQLException If the table creation fails
     */
    private void createChatTable(DatabaseAccess connection) throws SQLException {
        try {
            connection.executeSqlCommand(
                    "CREATE TABLE IF NOT EXISTS chat("
                            + "chat_id varchar(10),"
                            + "user_id varchar(10),"
                            + "PRIMARY KEY (chat_id),"
                            + "FOREIGN KEY (user_id) REFERENCES users(user_id))");
        } catch (SQLException e) {
            System.err.println("Error creating chat table: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Create the chatMessages table on mysql. If it already exists, do nothing.
     *
     * @param connection DatabaseAccess: The connection to the database
     * @throws SQLException If the table creation fails
     */
    private void createChatMessagesTable(DatabaseAccess connection) throws SQLException {
        try {
            connection.executeSqlCommand(
                    "CREATE TABLE IF NOT EXISTS chatMessages("
                            + "chat_id varchar(10),"
                            + "message text,"
                            + "user_id varchar(10),"
                            + "time timestamp,"
                            + "FOREIGN KEY (chat_id) REFERENCES chat(chat_id),"
                            + "FOREIGN KEY (user_id) REFERENCES users(user_id))");
        } catch (SQLException e) {
            System.err.println("Error creating chatMessages table: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Create the comments table on mysql. If it already exists, do nothing.
     *
     * @param connection DatabaseAccess: The connection to the database
     * @throws SQLException If the table creation fails
     */
    private void createCommentsTable(DatabaseAccess connection) throws SQLException {
        try {
            connection.executeSqlCommand(
                    "CREATE TABLE IF NOT EXISTS comments("
                            + "user_id varchar(10),"
                            + "post_id varchar(10),"
                            + "comment text,"
                            + "FOREIGN KEY (user_id) REFERENCES users(user_id),"
                            + "FOREIGN KEY (post_id) REFERENCES posts(post_id))");
        } catch (SQLException e) {
            System.err.println("Error creating comments table: " + e.getMessage());
            throw e;
        }
    }

    /**
     * Create the comments table on mysql. If it already exists, do nothing.
     *
     * @param connection DatabaseAccess: The connection to the database
     * @throws SQLException If the table creation fails
     */
    private void createLikesTable(DatabaseAccess connection) throws SQLException {
        try {
            connection.executeSqlCommand(
                    "CREATE TABLE IF NOT EXISTS likes("
                            + "user_id varchar(10),"
                            + "post_id varchar(10),"
                            + "FOREIGN KEY (user_id) REFERENCES users(user_id),"
                            + "FOREIGN KEY (post_id) REFERENCES posts(post_id))");
        } catch (SQLException e) {
            System.err.println("Error creating likes table: " + e.getMessage());
            throw e;
        }
    }

    public void run() throws SQLException {
        // First time changes
        try {
            access.executeSqlCommandSilent("ALTER TABLE names MODIFY COLUMN nconst VARCHAR(10);");
            access.executeSqlCommandSilent("CREATE INDEX idx_nconst ON names(nconst);");
        } catch (SQLException e) {
            // We'll silently fail on this error because it means the column was already
            // added
        }

        // Create the tables
        createChatTable(access);
        createChatMessagesTable(access);
        createCommentsTable(access);
        createLikesTable(access);

        // Create and populate the recommendations table
        // createRecommendationsTable(access);
        // Map<String, Map<String, Integer>> recommendations =
        // friendOfAFriendRecommendations(access);
        // if (recommendations == null) {
        // logger.error("Recommendations are null");
        // return;
        // }
        // writeResultsCsv(recommendations);
        // sendRecommendationsToDatabase(recommendations, access);
    }

    public static void main(String args[]) {
        tableCreator tc = new tableCreator();

        try {
            tc.run();
        } catch (SQLException e) {
            System.out.println(e);
        }

    }
}