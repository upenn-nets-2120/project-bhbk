import json
import os
import sys

import requests
from graphframes import GraphFrame
from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lit

os.environ["PYSPARK_PYTHON"] = sys.executable
os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable
os.environ["PYSPARK_SUBMIT_ARGS"] = (
    "--packages graphframes:graphframes:0.8.1-spark3.0-s_2.12 pyspark-shell"
)

spark = SparkSession.builder.getOrCreate()
spark.sparkContext.addPyFile("./graphframes-0.8.3-spark3.5-s_2.13.jar")

BASE_URL = "http://localhost:8000/api/graph"


hashtags = set()
users = set()


def construct_graph(edges):
    constructed_edges = set()
    constructed_vertices = set()

    for edge in edges:
        u = None
        v = None
        if "userId" in edge and "friendId" in edge:
            u = "user-" + str(edge["userId"])
            v = "user-" + str(edge["friendId"])
            users.add(u)
            users.add(v)
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["friendId"]))
        elif "userId" in edge and "hashtagId" in edge:
            u = "user-" + str(edge["userId"])
            v = "hashtag-" + str(edge["hashtagId"])
            users.add(u)
            hashtags.add(v)
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["hashtagId"]))
        elif "userId" in edge and "postId" in edge:
            u = "user-" + str(edge["userId"])
            v = "post-" + str(edge["postId"])
            users.add(u)
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["postId"]))
        elif "postId" in edge and "hashtagId" in edge:
            u = "post-" + str(edge["postId"])
            v = "hashtag-" + str(edge["hashtagId"])
            hashtags.add(v)
            constructed_vertices.add((u, edge["postId"]))
            constructed_vertices.add((v, edge["hashtagId"]))

        if u is not None and v is not None:
            constructed_edges.add((u, v, -1))
            constructed_edges.add((v, u, -1))

        if "userId" in edge:
            u = "shadow-" + str(edge["userId"])
            v = "user-" + str(edge["userId"])
            constructed_vertices.add((u, edge["userId"]))
            constructed_edges.add((u, v, -1))
            constructed_edges.add((u, u, -1))

    print(len(constructed_vertices), len(constructed_edges))
    return list(constructed_vertices), list(constructed_edges)


users_to_users = requests.get(BASE_URL + "/usersToUsers").json()
users_to_hashtags = requests.get(BASE_URL + "/usersToHashtags").json()
users_to_posts = requests.get(BASE_URL + "/usersToPosts").json()
posts_to_hastags = requests.get(BASE_URL + "/postsToHashtags").json()

uu_vs, uu_es = construct_graph(users_to_users)
uh_vs, uh_es = construct_graph(users_to_hashtags)
up_vs, up_es = construct_graph(users_to_posts)
ph_vs, ph_es = construct_graph(posts_to_hastags)

all_vertices = list(set(uu_vs + uh_vs + up_vs + ph_vs))
all_edges = list(set(uu_es + uh_es + up_es + ph_es))

vertices = spark.createDataFrame(all_vertices, ["id", "db_id"])
edges = spark.createDataFrame(all_edges, ["src", "dst", "weight"])

graph = GraphFrame(vertices, edges)


def get_edge_transfer(graphframe, weight):
    out_degrees = graphframe.outDegrees

    edges_with_degrees = graphframe.edges.join(
        out_degrees, graphframe.edges.src == out_degrees.id
    )

    # Calculate the weight for each edge as given weight divided by the out-degree of the source vertex
    weighted_edges = edges_with_degrees.withColumn(
        "weight", lit(weight) / col("outDegree")
    )

    # Select only the necessary columns to match the expected edge structure
    final_edges = weighted_edges.select(col("src"), col("dst"), col("weight"))

    # Create a new GraphFrame using the original vertices and the new weighted edges
    new_graphframe = GraphFrame(graphframe.vertices, final_edges)

    return new_graphframe


for h in hashtags:
    query = "src = " + f"'{h}'"
    edges = graph.edges.filter(query).collect()

    for value in edges:
        print(value.asDict())
