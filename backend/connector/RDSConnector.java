package backend.connector;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.List;
import java.util.ArrayList;

import backend.config.Config;

public class RDSConnector {
    
    public static void main(String[] args) {
        try {
            System.out.println("----MySQL JDBC Connection Testing -------");

            try {
                Class.forName("com.mysql.cj.jdbc.Driver");
            } catch (Exception ex) {
                System.out.println("Error: " + ex.getMessage());
                System.exit(1);
            }    
            
            Connection connection = null;

            try {
                connection = DriverManager.getConnection(Config.DATABASE_CONNECTION, Config.DATABASE_USERNAME, Config.DATABASE_PASSWORD);
            } catch (SQLException e) {
                System.out.println("Connection to database failed! Please make sure the RDS server is correct, the tunnel is enabled, and you have run the mysql command to create the database:\n" + e.getMessage());
                System.exit(1);
            }

            if (connection != null) {
                System.out.println("Connection successful!");
            } else {
                System.out.println("Failed to make connection");
            }

            // Set up Spark configuration
            SparkConf sparkConf = new SparkConf()
                    .setAppName(Config.SPARK_APP_NAME)
                    .setMaster(Config.SPARK_MASTER_URL) // Set the master URL, "local[*]" for local mode
                    .set("spark.driver.memory", Config.SPARK_DRIVER_MEMORY) // Set the driver memory to 10 gigabytes
                    .set("spark.testing.memory", Config.SPARK_TESTING_MEMORY); // Set testing memory

            // Use Spark configuration to read CSV and create a relational DB
            try (JavaSparkContext sparkContext = new JavaSparkContext(sparkConf)) {
                SparkSession sparkSession = SparkSession.builder().appName(Config.SPARK_APP_NAME).getOrCreate();

                // Configure JDBC connection properties
                // This is configured for tunneling via ssh, rather than direct-connect to the RDS instance
                String jdbcBaseUrl = Config.DATABASE_CONNECTION;
                String jdbcUsername = Config.DATABASE_USERNAME;
                String jdbcPassword = Config.DATABASE_PASSWORD;
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /**
     * Closes the JDBC and Spark connections.
     */
    public static void shutdown() {
        // Close JDBC Connection
        if (connection != null) {
            try {
                connection.close();
                System.out.println("JDBC connection closed.");
            } catch (SQLException e) {
                System.out.println("Failed to close the JDBC connection:");
                e.printStackTrace();
            }
        }
        
        // Stop Spark Session
        if (sparkSession != null) {
            sparkSession.stop();
            System.out.println("Spark session stopped.");
        }
    }
}