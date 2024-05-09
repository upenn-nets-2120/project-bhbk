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
    public static String GRAPH_UH = "output/graph_uh.txt";
	public static String GRAPH_UP = "output/graph_up.txt";
	public static String GRAPH_HASHTAG = "output/graph_hashtag.txt";
	public static String GRAPH_UU = "output/graph_uu.txt";
    public static String GRAPH_POST = "output/graph_post.txt";
    public static String GRAPH_USER = "output/graph_user.txt";
    public static String GRAPH_SHADOW = "output/graph_shadow.txt";

    public static String GRAPH_UH_S3 = "s3a://Instalite/graph_uh.txt";
	public static String GRAPH_UP_S3 = "s3a://Instalite/graph_up.txt";
	public static String GRAPH_HASHTAG_S3 = "s3a://Instalite/graph_hashtag.txt";
	public static String GRAPH_UU_S3 = "s3a://Instalite/graph_uu.txt";
    public static String GRAPH_POST_S3 = "s3a://Instalite/graph_post.txt";
    public static String GRAPH_USER_S3 = "s3a://Instalite/graph_user.txt";
    public static String GRAPH_SHADOW_S3 = "s3a://Instalite/graph_shadow.txt";


}
