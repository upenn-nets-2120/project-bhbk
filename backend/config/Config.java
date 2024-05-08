package backend.config;

public class Config {

    public static final String DATABASE_CONNECTION = "jdbc:mysql://localhost:3306/instalitedb";
    public static final String DATABASE_USERNAME = "admin";
    public static final String DATABASE_PASSWORD = "rds-password";

    public static final String SPARK_APP_NAME = "Instalite";
    public static final String SPARK_MASTER_URL = "local[*]";
    public static final String SPARK_DRIVER_MEMORY = "10g";
    public static final String SPARK_TESTING_MEMORY = "2147480000";

    /**
     * The path to the space-delimited social network data
     * //
     */
    public static String LOCAL_SPARK = "local[*]";

    // Retrieve AWS credentials from environment variables
    public static String ACCESS_KEY_ID = System.getenv("ACCESS_KEY_ID");
    public static String SECRET_ACCESS_KEY = System.getenv("SECRET_ACCESS_KEY");
    public static String SESSION_TOKEN = System.getenv("SESSION_TOKEN");
    public static String LIVY = System.getenv("LIVY_HOST");

    /**
     * How many RDD partitions to use?
     */
    public static int PARTITIONS = 5;

    public static String BUCKET_NAME = "Instalite";
    public static String JAR = "";
    public static String GRAPH_UH_FILE = "target/graph_uh.txt";
	public static String GRAPH_UP_FILE = "target/graph_up.txt";
	public static String GRAPH_HASHTAG_FILE = "target/graph_hashtag.txt";
	public static String GRAPH_UU_FILE = "target/graph_uu.txt";
    public static String GRAPH_POST_FILE = "target/graph_post.txt";

}
