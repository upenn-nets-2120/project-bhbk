import json

import requests
from pyspark.sql import SparkSession

spark = SparkSession.builder.getOrCreate()

BASE_URL = "http://localhost:8000/api/graph"


def construct_graph(edges):
    constructed_edges = []
    constructed_vertices = set()

    for edge in edges:
        if "userId" in edge and "friendId" in edge:
            u = "user-" + str(edge["userId"])
            v = "user-" + str(edge["friendId"])
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["friendId"]))
        elif "userId" in edge and "hashtagId" in edge:
            u = "user-" + str(edge["userId"])
            v = "hashtag-" + str(edge["hashtagId"])
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["hashtagId"]))
        elif "userId" in edge and "postId" in edge:
            u = "user-" + str(edge["userId"])
            v = "post-" + str(edge["postId"])
            constructed_vertices.add((u, edge["userId"]))
            constructed_vertices.add((v, edge["postId"]))
        elif "postId" in edge and "hashtagId" in edge:
            u = "post-" + str(edge["postId"])
            v = "hashtag-" + str(edge["hashtagId"])
            constructed_vertices.add((u, edge["postId"]))
            constructed_vertices.add((v, edge["hashtagId"]))

        constructed_edges.append((u, v))
        constructed_edges.append((v, u))

    return list(constructed_vertices), constructed_edges


users_to_users = requests.get(BASE_URL + "/usersToUsers").json()
users_to_hashtags = requests.get(BASE_URL + "/usersToHashtags").json()
users_to_posts = requests.get(BASE_URL + "/usersToPosts").json()
posts_to_hastags = requests.get(BASE_URL + "/postsToHashtags").json()

uu_vs, uu_es = construct_graph(users_to_users)
uh_vs, uh_es = construct_graph(users_to_hashtags)
up_vs, up_es = construct_graph(users_to_posts)
ph_vs, ph_es = construct_graph(posts_to_hastags)
