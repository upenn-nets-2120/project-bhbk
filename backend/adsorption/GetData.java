package backend.adsorption;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import backend.config.Config;

public class GetData {

    private Connection connection;
	private BufferedWriter graph_uh; // User-Hashtag
    private BufferedWriter graph_up; // User-Post (likes)
    private BufferedWriter graph_uu; // User-User (friends)
    private BufferedWriter graph_hashtag; // Hashtag
	private BufferedWriter graph_post; // Post
    private BufferedWriter graph_user; // User injection
    private BufferedWriter graph_shadow; // Shadow to shadow (user)

    public GetData() {
    }

    /**
     * Initialize the database connection and open files for graph data
     */
    public void initialize() throws IOException, SQLException {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            connection = DriverManager.getConnection(
                Config.DATABASE_CONNECTION, 
                Config.DATABASE_USERNAME, 
                Config.DATABASE_PASSWORD
            );
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            throw new RuntimeException("MySQL JDBC driver not found.", e);
        }

        graph_uh = new BufferedWriter(new FileWriter(Config.GRAPH_UH));
        graph_up = new BufferedWriter(new FileWriter(Config.GRAPH_UP));
        graph_uu = new BufferedWriter(new FileWriter(Config.GRAPH_UU));
        graph_hashtag = new BufferedWriter(new FileWriter(Config.GRAPH_HASHTAG));
		graph_post = new BufferedWriter(new FileWriter(Config.GRAPH_POST));
        graph_user = new BufferedWriter(new FileWriter(Config.GRAPH_USER));
        graph_shadow = new BufferedWriter(new FileWriter(Config.GRAPH_SHADOW));
    }

    /**
     * Run the data fetching and graph building process
     */
    public void run() throws SQLException, IOException {
        Statement stmt = connection.createStatement();

        // Fetch injection data
        ResultSet rsLikes = stmt.executeQuery("SELECT id from users");
        while (rsLikes.next()) {
            String user = rsLikes.getString("id");
            graph_user.write(user + "_s," + user + "_u");
            graph_user.newLine();
			graph_shadow.write(user + "_s," + user + "_s");
            graph_shadow.newLine();
        }

        // Fetch user-post like relations
        ResultSet rsLikes = stmt.executeQuery("SELECT userId, postId FROM posts_likes");
        while (rsLikes.next()) {
            String user = rsLikes.getString("userId");
            String post = rsLikes.getString("postId");
            graph_up.write(user + "_u," + post + "_p");
            graph_up.newLine();
			graph_post.write(post + "_p," + user + "_u");
            graph_post.newLine();
        }

        // Fetch user-user friend relations
        ResultSet rsFriends = stmt.executeQuery("SELECT userId, friendId FROM user_friends");
        while (rsFriends.next()) {
            String user = rsFriends.getString("userId");
            String friend = rsFriends.getString("friendId");
            graph_uu.write(user + "_u," + friend + "_u");
            graph_uu.newLine();
        }

        // Fetch user-hashtag interest relations
        ResultSet rsUserHashtags = stmt.executeQuery("SELECT userId, hashtagId FROM user_hashtags");
        while (rsUserHashtags.next()) {
            String user = rsUserHashtags.getString("userId");
            String hashtag = rsUserHashtags.getString("hashtagId");
            graph_uh.write(user + "_u," + hashtag + "_h");
            graph_uh.newLine();
			graph_hashtag.write(hashtag + "_h," + user + "_u");
			graph_hashtag.newLine();
        }

		// Fetch post-hashtag interest relations
        ResultSet rsPostHashtags = stmt.executeQuery("SELECT postId, hashtagId FROM posts_to_hashtags");
        while (rsPostHashtags.next()) {
            String post = rsPostHashtags.getString("postId");
            String hashtag = rsPostHashtags.getString("hashtagId");
            graph_post.write(post + "_p," + hashtag + "_h");
            graph_post.newLine();
			graph_hashtag.write(hashtag + "_h," + post + "_p");
            graph_hashtag.newLine();
        }

        stmt.close();
    }

    /**
     * Graceful shutdown
     */
    public void shutdown() {
        try {
            if (connection != null) connection.close();
            closeWriter(graph_uh);
            closeWriter(graph_up);
            closeWriter(graph_uu);
            closeWriter(graph_hashtag);
            closerWriter(graph_post);
            closeWriter(graph_user);
            closerWriter(graph_shadow);
        } catch (final IOException | SQLException e) {
            e.printStackTrace();
        }
    }

	private void closeWriter(BufferedWriter writer) throws IOException {
        if (writer != null) {
            writer.close();
        }
    }

    public static void main(String[] args) {
        GetData getData = new GetData();
        try {
            getData.initialize();
            getData.run();
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            getData.shutdown();
        }
    }
}
