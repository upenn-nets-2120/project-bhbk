import { kafka, KafkaMessage } from "./kafka";
import {createPost} from "../views/posts";
import { NewPost } from "../types/post";
import { SignUpUser } from "../types/user";
import { getUserById } from "../views/user"
import { createUser } from "../views/auth"
import { uploadHashtag } from "../views/hashtags"
import { fetchPostsAndEmbedData } from "../views/llmSearch"

const consumer = kafka.consumer({
  groupId: "nets-2120-group-100",
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
    },
  });
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  await consumer.disconnect();
  return kafkaMessages
};

async function updateNewsTwitter() {
  try{
    const kafkaMessages = await run().catch(console.error);

    for (let msg of kafkaMessages || []) {
        if (!msg.message.value) {
          return;
        }
        console.log(msg)
        const rawPost = JSON.parse(msg.message.value.toString());
        const twitterUser = await getUserById(12); //NEWS user has default id 12

        console.log(twitterUser)

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

        hashtags.forEach(async hashtag => {
          if (post.id){
            await uploadHashtag(post.id, hashtag)
          }
        })
        fetchPostsAndEmbedData();
    }
  } catch (error) {
    console.error("Error updating news:", error);
  }
}

export { updateNewsTwitter };
