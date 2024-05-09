import { kafka, KafkaMessage } from "./kafka"
import { NewPost } from "../types/post";
import { SignUpUser } from "../types/user";
import { getUserById, getForeignUser } from "../views/user"
import { createPost} from "../views/posts";
import { createUser } from "../views/auth"
import { Partitioners } from "kafkajs";
import { uploadHashtag } from "../views/hashtags"
import { fetchPostsAndEmbedData } from "../views/llmSearch"

const consumer = kafka.consumer({ groupId: "nets-2120-group-61" });
const producer = kafka.producer({createPartitioner: Partitioners.LegacyPartitioner});

function generateRandomString(length: number): string {
  return Array.from({ length }, () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 62)]).join('');
}

let running = false;

const extractHashtags = (text: string) => {
  const regex = /#(\w+)/g;

  const hashtagList: string[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    hashtagList.push(match[1]);
  }

  return hashtagList;
};

export async function getFedPosts() {
    if (!running) {
      await consumer.connect();
      await consumer.subscribe({ topic: 'FederatedPosts', fromBeginning: true });
      running = true;
    }
    let i = 0;
    await consumer.run({
      eachMessage: async ({ topic, partition, message }: KafkaMessage) => {
        try{
          if (message?.value) {
            const post = JSON.parse(message.value.toString());
            const { post_json, attach } = post;
            let operativeJson = post_json
            if (!operativeJson) {
              operativeJson = post
            }
            const username: string = operativeJson.username
            const site: string = operativeJson.source_site.substring(1);

            if (site == "g16") {
              return;
            }

            const foreignUser = await getForeignUser(username, site);
            let authorId;

            if (!foreignUser) {

              let user = {
                firstName: username,
                lastName: username,
                email: `${username}@${site}.com`,
                username: username,
                password: generateRandomString(10),
                affiliation: site,
                dob: new Date()
              };

              user = user satisfies SignUpUser

              const newForeignUser = await createUser(user);
              authorId = newForeignUser.id;
            } else {
              authorId = foreignUser.id;
            }

            if (authorId) {
              const newPost = {
                imageUrl: attach?.image,
                text: operativeJson.post_text,
                authorId: authorId
              }
              const hashtags: string[] = extractHashtags(newPost.text)
            
              const post = await createPost(newPost, authorId)

              for (const hashtag of hashtags) {
                if (post.id){
                  await uploadHashtag(post.id, hashtag)
                }
              }
            }
          }    
        } catch (error) {
          console.error(error)
        }
        if (i++ > 100) {
          await consumer.stop();
          await consumer.disconnect();
          console.log("Rate Limited FederatedPosts Stream");
        }
      },
    });
    setTimeout(async () => {
      await consumer.stop();
      await consumer.disconnect();
      running = false;
    }, 1000);

    await fetchPostsAndEmbedData()
    return;
  };
  

  export async function pushFedPost(post: NewPost) {
    await producer.connect();
    
    if (!post.authorId) {
       return;
    }

    const user = await getUserById(post.authorId);

    const packageJson = {
        post_json: {
            username: user?.username,
            source_site: 'g16',
            post_uuid_within_site: post.id,
            post_text: post.text,
            content_type: "text/html"
        },
        attach: {
            image: post.imageUrl
        }
    }

    const packageString = JSON.stringify(packageJson)

    producer.send({
        topic: 'FederatedPosts',
        messages: [ {value: packageString} ]
    })
    .then(producer.disconnect)

  };

  getFedPosts();