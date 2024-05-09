package backend.adsorption;

import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import scala.Tuple2;

import java.io.IOException;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;

import backend.config.Config;

public class AdsorptionAlgo implements Job<Tuple2<List<MyPair<String, Tuple2<String, Double>>>, List<MyPair<String, Tuple2<String, Double>>>>> {
    /**
     * Connection to Apache Spark
     */
    SparkSession spark;
    
    JavaSparkContext context;
    
    public AdsorptionAlgo() {
        System.setProperty("file.encoding", "UTF-8");
    }

    /**
     * Initialize the database connection and open the file
     * 
     * @throws IOException
     * @throws InterruptedException 
     */
    public void initialize() throws IOException, InterruptedException {
        spark = SparkConnector.getSparkConnection();
        context = SparkConnector.getSparkContext();
    }
    
    /**
     * Graph builder
     * 
     * @param filePath
     * @return JavaPairRDD: (from, to)
     */
    JavaPairRDD<String, String> getGraph(String filePath) {
        return context
            .textFile(filePath, Config.PARTITIONS)
            .map(line -> line.toString().split(","))
            .mapToPair(parts -> new Tuple2<>(parts[0], parts[1]))
            .distinct();
    }
    
    JavaPairRDD<String, Tuple2<String, Double>> getEdges(JavaPairRDD<String, String> graph, double weight) {
        return graph.join(
            graph
            .mapToPair(x -> new Tuple2<String, Double>(x._1, 1.0))
            .reduceByKey((x, y) -> x + y)
            .mapToPair(x -> new Tuple2<String, Double>(x._1, weight / x._2))
        );
    }

    /**
     * Main functionality in the program: read and process the files
     * 
     * @throws IOException
     * @throws InterruptedException
     */
    public Tuple2<List<MyPair<String, Tuple2<String, Double>>>, List<MyPair<String, Tuple2<String, Double>>>> run(int iter, double thres, boolean debug) throws IOException, InterruptedException {
        
        JavaPairRDD<String, Tuple2<String, Double>> edges = 
            getEdges(getGraph(Config.GRAPH_UH_S3), 0.3)
            .union(getEdges(getGraph(Config.GRAPH_HASHTAG_S3), 1.0))
            .union(getEdges(getGraph(Config.GRAPH_POST_S3), 1.0))
            .union(getEdges(getGraph(Config.GRAPH_UP_S3), 0.4))
            .union(getEdges(getGraph(Config.GRAPH_UU_S3), 0.3))
            .union(getEdges(getGraph(Config.GRAPH_USER_S2), 0.25))
            .union(getEdges(getGraph(Config.GRAPH_SHADOW_S3), 1.0))

        System.out.println(
            "Graph: " + edges.keys().distinct().count() +
            " vertices and " + edges.count() + " edges.");
        
        JavaPairRDD<String,Tuple2<String,Double>> ranks = edges
            .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(x._1, new Tuple2<String,Double>(x._1,1.0)));
        
        double dcurr = Double.MAX_VALUE;
        for (int i = 1; i <= iter && dcurr >= thres; i++) {
            JavaPairRDD<String, Tuple2<String, Double>> newRanks = edges
                .join(ranks)
                .mapToPair(x -> new Tuple2<Tuple2<String,String>,Double>(
                        new Tuple2<String,String>(x._2._1._1, x._2._2._1),
                        x._2._2._2 * x._2._1._2
                    )
                )
                .reduceByKey((a,b)->a+b)
                .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                        x._1._1,
                        new Tuple2<String,Double>(x._1._2,x._2)
                    )
                );
            
            JavaPairRDD<String,Double> totalRanks = newRanks
                .mapToPair(x->new Tuple2<String,Double>(x._1,x._2._2))
                .reduceByKey((a,b)->a+b);
            
            newRanks = newRanks
                .join(totalRanks)
                .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                        x._1,
                        new Tuple2<String,Double>(x._2._1._1, x._2._1._2 / x._2._2)
                    )
                )
                .filter(x->x._2._2 >= thres * 0.01);
            
            if(debug) {
                System.out.println("round "+i); 
                newRanks
                    .collect()
                    .stream()
                    .forEach(x->System.out.println(x._1+" "+x._2._1+" "+x._2._2));
            }
            
            dcurr = newRanks
                .join(ranks)
                .values()
                .map(x->Math.abs(x._1._2 - x._2._2))
                .reduce((a,b)->Math.max(a,b));
            
            if(newRanks.keys().distinct().count() != ranks.keys().distinct().count())
                dcurr = Double.MAX_VALUE;
            
            ranks = newRanks;
        }
                
        // Filter and collect recommended posts
        List<MyPair<String, Tuple2<String, Double>>> postRecommendations = ranks
            .filter(x->x._1.charAt(x._1.length()-1)=='p')
            .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                    x._2._1.substring(0,x._2._1.length()-2),
                    new Tuple2<String,Double>(x._1.substring(0,x._1.length()-2), x._2._2)
                )
            )
            .filter(x->x._2._2 >= 0.01)
            .subtractByKey(
                getGraph(Config.GRAPH_UP_S3)
                    .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                            x._1.substring(0,x._1.length()-2),
                            new Tuple2<String,Double>(x._2.substring(0,x._2.length()-2),0.0)
                        )
                    )
            )
            .map(x->new MyPair<String,Tuple2<String,Double>>(x._1, x._2))
            .collect();
        
        // Filter and collect recommended friends
        List<MyPair<String, Tuple2<String, Double>>> friendRecommendations = ranks
            .filter(x->x._1.charAt(x._1.length()-1)=='u')
            .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                    x._2._1.substring(0,x._2._1.length()-2),
                    new Tuple2<String,Double>(x._1.substring(0,x._1.length()-2), x._2._2)
                )
            )
            .filter(x->x._2._2 >= 0.01)
            .subtractByKey(
                getGraph(Config.GRAPH_UU_S3)
                    .mapToPair(x->new Tuple2<String,Tuple2<String,Double>>(
                            x._1.substring(0,x._1.length()-2),
                            new Tuple2<String,Double>(x._2.substring(0,x._2.length()-2),0.0)
                        )
                    )
            )
            .map(x->new MyPair<String,Tuple2<String,Double>>(x._1, x._2))
            .collect();
        
        // Sort post recommendations based on scores in descending order
        postRecommendations.sort(Comparator.comparing(x->x.getValue()._2).reversed());
        
        // Sort friend recommendations based on scores in descending order
        friendRecommendations.sort(Comparator.comparing(x->x.getValue()._2).reversed());
        
        return new Tuple2<>(postRecommendations, friendRecommendations);
    }

    @Override
    public Tuple2<List<MyPair<String, Tuple2<String, Double>>>, List<MyPair<String, Tuple2<String, Double>>>> call(JobContext arg0) throws Exception {
        initialize();
        int iter = 15;
        double thres = 0.02;
        boolean debug = false;
        return run(iter, thres, debug);
    }
}