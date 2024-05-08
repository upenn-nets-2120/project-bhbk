package backend.adsorption;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.util.List;
import java.util.concurrent.ExecutionException;

import org.apache.livy.JobHandle;
import org.apache.livy.LivyClient;
import org.apache.livy.LivyClientBuilder;

import backend.config.Config;

// Driver class for computing ranks via a Livy job
public class ComputeRanksLivy {

    public static void main(String[] args) throws IOException, URISyntaxException, InterruptedException, ExecutionException {
        // Initialize database connection
        Connection conn = initializeDBConnection();

        try {
            // Initialize Livy client
            LivyClient client = new LivyClientBuilder()
                .setURI(new URI(Config.LIVY + ":8998"))
                .build();

            try {
                String jar = Config.JAR;
                System.out.printf("Uploading %s to the Spark context...\n", jar);
                client.uploadJar(new File(jar)).get();

                System.out.println("Submitting job through Livy...");
                List<MyPair<MyPair<String, String>, Double>> feed = client
                    .submit(new AdsorptionAlgo())
                    .get();

                System.out.println("Number of elements in feed: " + feed.size());
                saveResultsToDatabase(feed, conn);
            } catch(Exception e) {
                e.printStackTrace();
            } finally {
                client.stop(true);
            }
        } finally {
            conn.close();
        }
    }

    // Initialize connection to the MySQL database
    private static Connection initializeDBConnection() {
        try {
            String dbUrl = Config.DATABASE_CONNECTION;
            Connection conn = DriverManager.getConnection(dbUrl, Config.DATABASE_USERNAME, Config.DATABASE_PASSWORD);
            System.out.println("Connected to the MySQL server successfully.");
            return conn;
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }

    // Save results to MySQL database
    private static void saveResultsToDatabase(List<MyPair<MyPair<String, String>, Double>> feed, Connection conn) throws SQLException {
        String insertQuery = "INSERT INTO feed (user_id, post_id, rank_score) VALUES (?, ?, ?)";
        PreparedStatement pstmt = conn.prepareStatement(insertQuery);
        for (MyPair<MyPair<String, String>, Double> item : feed) {
            pstmt.setString(1, item.getKey().getKey());
            pstmt.setString(2, item.getKey().getValue());
            pstmt.setDouble(3, item.getValue());
            pstmt.executeUpdate();
        }
        System.out.println("Results successfully saved to database.");
    }
}
