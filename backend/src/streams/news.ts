import { kafka, KafkaMessage } from "./kafka";
import {createPost} from "../views/posts";
import { NewPost } from "../types/post";
import { SignUpUser } from "../types/user";
import { getUserById } from "../views/user"
import { createUser } from "../views/auth"
import { uploadHashtag } from "../views/hashtags"
import { fetchPostsAndEmbedData } from "../views/llmSearch"

const consumer = kafka.consumer({
  groupId: "nets-2120-group-107",
});



async function run(): Promise<KafkaMessage[]> {
  const kafkaMessages: KafkaMessage[] = [];


  await consumer.connect();
  await consumer.subscribe({ topic: "Twitter-Kafka", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }: KafkaMessage) => {
      kafkaMessages.push({
        topic,
        partition,
        message: {
          value: message?.value,
        },
      });
      console.log({
        value: message?.value?.toString(),
      });
      console.log(kafkaMessages.length)
      if (kafkaMessages.length > 10) {
        consumer.disconnect();
      }
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  await consumer.stop();
  await consumer.disconnect();

  return kafkaMessages
};

async function updateNewsTwitter() {
    const kafkaMessages = await run().catch(console.error) || [];
    let i = 0;

    for (const msg of kafkaMessages || []) {
      try{
        if (!msg.message.value) {
          return;
        }
        const rawPost = JSON.parse(msg.message.value.toString());
        const twitterUser = await getUserById(12); //NEWS user has default id 12

        if (!twitterUser) {
          let user = {
            id: 12,
            firstName: "NEWS",
            lastName: "NEWS",
            email: "NEWS@NEWS.COM",
            username: "NEWS",
            password: "NEWS",
            affiliation: "Twitter",
            dob: new Date()
          };

          user = user satisfies SignUpUser

          await createUser(user);
        }

        console.log(rawPost)

        const processedPost = {
          text: rawPost.text || rawPost.tex,
          authorId: 12,
          createdAt: rawPost.created_at
        }

        const hashtags: string[] =  rawPost.hashtags

        const newsPost = processedPost satisfies NewPost;
        const post = await createPost(newsPost, 12)

        console.log("log: ", i++);
        console.log(hashtags.length)

        for (const hashtag of hashtags) {
          console.log(hashtag)
          if (post.id){
            await uploadHashtag(post.id, hashtag)
            console.log("uploaded hashtag ", post.id, hashtag)
          }
        }
      } catch (error) {
      console.error("Error updating news:", error);
    }
  }
  await fetchPostsAndEmbedData();
}

// updateNewsTwitter()

export { updateNewsTwitter };
