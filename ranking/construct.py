import json
import os
import sys
import time
from multiprocessing import Process

import findspark
import requests
import schedule
from graphframes import GraphFrame
from pyspark.sql import SparkSession
from pyspark.sql.functions import abs as sql_abs
from pyspark.sql.functions import col, desc, expr, lit, split
from pyspark.sql.functions import sum as sql_sum


def main():
    print("Executing job...", end="\n", flush=True)
    os.environ["PYSPARK_PYTHON"] = sys.executable
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable
    os.environ["PYSPARK_SUBMIT_ARGS"] = (
        "--packages graphframes:graphframes:0.8.1-spark3.0-s_2.12 pyspark-shell"
    )

    findspark.add_packages("mysql:mysql-connector-java:8.0.11")

    spark = SparkSession.builder.config("spark.driver.memory", "10g").getOrCreate()
    # spark.sparkContext.addPyFile("./graphframes-0.8.3-spark3.5-s_2.13.jar")

    BASE_URL = "http://100.25.138.192:8000/api"

    hashtags = set()
    users = set()
    posts = set()
    shadow_users = set()

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
                constructed_edges.add((u, v, -1, "u-u"))
                constructed_edges.add((v, u, -1, "u-u"))
            elif "userId" in edge and "hashtagId" in edge:
                u = "user-" + str(edge["userId"])
                v = "hashtag-" + str(edge["hashtagId"])
                users.add(u)
                hashtags.add(v)
                constructed_vertices.add((u, edge["userId"]))
                constructed_vertices.add((v, edge["hashtagId"]))
                constructed_edges.add((u, v, -1, "u-h"))
                constructed_edges.add((v, u, -1, "h-u"))
            elif "userId" in edge and "postId" in edge:
                u = "user-" + str(edge["userId"])
                v = "post-" + str(edge["postId"])
                users.add(u)
                posts.add(v)
                constructed_vertices.add((u, edge["userId"]))
                constructed_vertices.add((v, edge["postId"]))
                constructed_edges.add((u, v, -1, "u-p"))
                constructed_edges.add((v, u, -1, "p-u"))
            elif "postId" in edge and "hashtagId" in edge:
                u = "post-" + str(edge["postId"])
                v = "hashtag-" + str(edge["hashtagId"])
                posts.add(u)
                hashtags.add(v)
                constructed_vertices.add((u, edge["postId"]))
                constructed_vertices.add((v, edge["hashtagId"]))
                constructed_edges.add((u, v, -1, "p-h"))
                constructed_edges.add((v, u, -1, "h-p"))

            if "userId" in edge:
                u = "shadow-" + str(edge["userId"])
                v = "user-" + str(edge["userId"])
                shadow_users.add(u)
                constructed_vertices.add((u, edge["userId"]))
                constructed_edges.add((u, v, -1, "su-u"))
                constructed_edges.add((u, u, -1, "su-su"))

        return list(constructed_vertices), list(constructed_edges)

    users_to_users = requests.get(BASE_URL + "/graph/usersToUsers").json()
    users_to_hashtags = requests.get(BASE_URL + "/graph/usersToHashtags").json()
    users_to_posts = requests.get(BASE_URL + "/graph/usersToPosts").json()
    posts_to_hastags = requests.get(BASE_URL + "/graph/postsToHashtags").json()

    uu_vs, uu_es = construct_graph(users_to_users)
    uh_vs, uh_es = construct_graph(users_to_hashtags)
    up_vs, up_es = construct_graph(users_to_posts)
    ph_vs, ph_es = construct_graph(posts_to_hastags)

    all_vertices = list(set(uu_vs + uh_vs + up_vs + ph_vs))
    all_edges = list(set(uu_es + uh_es + up_es + ph_es))

    vertices = spark.createDataFrame(all_vertices, ["id", "db_id"])
    edges = spark.createDataFrame(all_edges, ["src", "dst", "weight", "type"])

    graph = GraphFrame(vertices, edges)

    def update_edge(edges, src, dest, target_weight):
        for index, edge in enumerate(edges):
            if edge[0] == src and edge[1] == dest:
                edges[index] = (edge[0], edge[1], target_weight, edge[3])

    def update_hashtag_edges(hashtags):
        for h in hashtags:
            query = "src = " + f"'{h}'"
            edges = graph.edges.filter(query).collect()

            if len(edges) > 0:
                new_weight = 1 / len(edges)

                for value in edges:
                    edge = value.asDict()
                    update_edge(all_edges, edge["src"], edge["dst"], new_weight)

    def update_post_edges(posts):
        for p in posts:
            query = "src = " + f"'{p}'"
            edges = graph.edges.filter(query).collect()

            if len(edges) > 0:
                new_weight = 1 / len(edges)

                for value in edges:
                    edge = value.asDict()
                    update_edge(all_edges, edge["src"], edge["dst"], new_weight)

    def update_user_edges(users, type, weight):
        for u in users:
            query = f"src = '{u}' AND type = '{type}'"
            edges = graph.edges.filter(query).collect()

            if len(edges) > 0:
                new_weight = weight / len(edges)

                for value in edges:
                    edge = value.asDict()
                    update_edge(all_edges, edge["src"], edge["dst"], new_weight)

    update_hashtag_edges(hashtags)
    update_post_edges(posts)
    update_user_edges(users, "u-u", 0.3)
    update_user_edges(users, "u-p", 0.4)
    update_user_edges(users, "u-h", 0.3)
    update_user_edges(shadow_users, "su-su", 1.0)
    update_user_edges(shadow_users, "su-u", 0.25)

    for edge in all_edges:
        if edge[2] <= 0:
            print(edge)

    edges = spark.createDataFrame(all_edges, ["src", "dst", "weight", "type"])
    graph = GraphFrame(vertices, edges)

    initial = []

    def initialize_rank():
        for u in shadow_users:
            v = u.replace("shadow", "user")
            initial.append((u, v, 1.0))
        columns = ["src", "dst", "weight"]
        rank = spark.createDataFrame(initial, columns)
        return rank

    decay = 0.15
    max_val = float("inf")
    i = 1

    ranks = initialize_rank()
    while i <= 15 and max_val >= 0.02:
        print(i)
        # Join edge with ranks
        new_ranks = edges.join(ranks, edges.src == ranks.src).select(
            edges.dst.alias("to_user"),
            ranks.dst.alias("user"),
            (ranks.weight * edges.weight).alias("rank"),
        )

        # Reduce by key to get total user rank
        new_ranks = (
            new_ranks.groupBy("to_user", "user")
            .agg({"rank": "sum"})
            .select(col("to_user"), col("user"), col("sum(rank)").alias("rank"))
        )

        # Join with total ranks to get normalized ranks
        total_ranks = (
            new_ranks.groupBy("to_user")
            .agg({"rank": "sum"})
            .withColumnRenamed("sum(rank)", "total_rank")
        )
        new_ranks = (
            new_ranks.join(total_ranks, "to_user")
            .withColumn("normalized_rank", col("rank") / col("total_rank"))
            .filter(col("normalized_rank") >= 0 * decay)
            .select("to_user", "user", "normalized_rank")
        )

        # Update max
        if (
            new_ranks.select("to_user").distinct().count()
            != ranks.select("src").distinct().count()
        ):
            max_val = float("inf")
        else:
            max_val = (
                new_ranks.join(ranks, new_ranks.to_user == ranks.src)
                .select(sql_abs(col("normalized_rank") - col("weight")).alias("diff"))
                .agg({"diff": "max"})
                .collect()[0][0]
            )

        # Update ranks
        ranks = (
            new_ranks.withColumnRenamed("to_user", "src")
            .withColumnRenamed("normalized_rank", "weight")
            .withColumnRenamed("user", "dst")
        )

        i += 1

    ranks = ranks.filter(split(col("src"), "-")[1] != split(col("dst"), "-")[1])

    posts = (
        ranks.filter(col("src").contains("post"))
        .select(
            split(col("dst"), "-")[1].alias("user_id"),
            split(col("src"), "-")[1].alias("post_id"),
            col("weight").alias("rank"),
        )
        .filter(col("rank") >= 0.01)
        .select("user_id", "post_id", "rank")
        .orderBy(["user_id", "rank"], ascending=[True, False])
    )

    rankedPosts = posts.toPandas().to_dict(orient="records")

    print(rankedPosts)

    users = (
        ranks.filter((col("src").contains("user")) & (col("dst").contains("user")))
        .select(
            split(col("dst"), "-")[1].alias("user_id"),
            split(col("src"), "-")[1].alias("friend_rec_id"),
            col("weight").alias("rank"),
        )
        .filter(col("rank") >= 0.01)
        .select("user_id", "friend_rec_id", "rank")
        .orderBy(["user_id", "rank"], ascending=[True, False])
    )

    rankedUsers = users.toPandas().to_dict(orient="records")

    print(rankedUsers)

    headers = {"Content-Type": "application/json", "Accept": "application/json"}

    requests.post(
        BASE_URL + "/graph/friends", data=json.dumps(rankedUsers), headers=headers
    )
    requests.post(
        BASE_URL + "/graph/posts", data=json.dumps(rankedPosts), headers=headers
    )

    spark.stop()


schedule.every(5).minutes.do(main)

while True:
    schedule.run_pending()
    time.sleep(1)
