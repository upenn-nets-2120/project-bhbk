import findspark
findspark.init()

import sys
import os

# Append the directory containing the config module to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'config')))

import itertools
import config
from pyspark import SparkConf, SparkContext
from pyspark.sql import SparkSession

def line_to_friend_ownership(row):
    user_id = row["user_id"]
    friends = row["friend_id"].split(',') if row["friend_id"] else []
    return user_id, list(map(int, friends))

def friend_ownership_to_connection(f_o):
    user_id, friends = f_o
    connections = []
    for friend_id in friends:
        key = (min(user_id, friend_id), max(user_id, friend_id))
        connections.append((key, 0))
    for friend_pair in itertools.combinations(friends, 2):
        key = (min(friend_pair), max(friend_pair))
        connections.append((key, 1))
    return connections

def mutual_friend_count_to_recommendation(m):
    connection, count = m
    friend_0, friend_1 = connection
    return [(friend_0, (friend_1, count)), (friend_1, (friend_0, count))]

# Initialize Spark Session with MySQL Configuration
spark = SparkSession.builder \
    .appName("Friend Recommendations") \
    .config("spark.jars.packages", "mysql:mysql-connector-java:8.0.11") \
    .getOrCreate()

# Read data from MySQL
df = spark.read.format("jdbc") \
    .option("url", Config.DATABASE_CONNECTION) \
    .option("driver", "com.mysql.cj.jdbc.Driver") \
    .option("dbtable", "user_friends") \
    .option("user", Config.DATABASE_USERNAME) \
    .option("password", Config.DATABASE_PASSWORD) \
    .load()

# Convert DataFrame to RDD and prepare it as per your original function's need
friends_rdd = df.rdd.map(line_to_friend_ownership)

# Process the friend relationships
friend_edges = friends_rdd.flatMap(friend_ownership_to_connection)
friend_edges.cache()

# Calculate mutual friend counts
mutual_friend_counts = friend_edges.groupByKey() \
    .filter(lambda edge: 0 not in edge[1]) \
    .map(lambda edge: (edge[0], sum(edge[1])))

# Create and process recommendations
recommendations = mutual_friend_counts.flatMap(mutual_friend_count_to_recommendation) \
    .groupByKey() \
    .map(lambda m: (m[0], sorted(list(m[1]), key=lambda x: (-x[1], x[0]))))

# Collect and print all recommendations
all_recommendations = recommendations.collect()
for rec in all_recommendations:
    print(rec)

# Stop the Spark session
spark.stop()
