const path = require("path");
const fs = require("fs");
const tf = require("@tensorflow/tfjs-node");
const faceapi = require("@vladmandic/face-api");
const https = require("https");

import { ChromaClient } from "chromadb";

let optionsSSDMobileNet;

const getArray = (array) => {
  return Array.from(array);
};

async function getImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const bufs = [];
        res.on("data", (chunk) => bufs.push(chunk));
        res.on("end", () => {
          const data = Buffer.concat(bufs);
          resolve(data); // Resolve the Promise with the image data
        });
      })
      .on("error", reject); // Reject the Promise on an error
  });
}

async function getEmbeddingsFromUrl(imageFile) {
  const buffer = await getImageFromUrl(imageFile);
  const tensor = tf.node.decodeImage(buffer, 3);

  const faces = await faceapi
    .detectAllFaces(tensor, optionsSSDMobileNet)
    .withFaceLandmarks()
    .withFaceDescriptors();
  tf.dispose(tensor);

  return faces.map((face) => getArray(face.descriptor));
}

async function getEmbeddings(imageFile) {
  const buffer = fs.readFileSync(imageFile);
  const tensor = tf.node.decodeImage(buffer, 3);

  const faces = await faceapi
    .detectAllFaces(tensor, optionsSSDMobileNet)
    .withFaceLandmarks()
    .withFaceDescriptors();
  tf.dispose(tensor);

  return faces.map((face) => getArray(face.descriptor));
}

async function initializeFaceModels() {
  console.log("Initializing FaceAPI...");

  await tf.ready();
  await faceapi.nets.ssdMobilenetv1.loadFromDisk("model");
  optionsSSDMobileNet = new faceapi.SsdMobilenetv1Options({
    minConfidence: 0.5,
    maxResults: 1,
  });
  await faceapi.nets.faceLandmark68Net.loadFromDisk("model");
  await faceapi.nets.faceRecognitionNet.loadFromDisk("model");
}

async function indexAllFaces(pathName, image, collection) {
  const embeddings = await getEmbeddings(pathName);

  let success = true;
  let inx = 1;
  for (const embedding of embeddings) {
    const data = {
      ids: [`${image}-${inx++}`],
      embeddings: [embedding],
      metadatas: [{ source: "imdb" }],
      documents: [image],
    };
    const res = await collection.add(data);

    if (!res) {
      console.error(
        `Failed to add image embedding for ${image} to collection.`
      );
      success = false;
    }
  }
  return success;
}

async function findTopKMatches(collection, image, k) {
  const queryEmbeddings = await getEmbeddingsFromUrl(image);
  const ret = [];

  for (const queryEmbedding of queryEmbeddings) {
    const results = await collection.query({
      queryEmbeddings,
      nResults: k,
    });

    ret.push(results);
  }
  return ret;
}

async function compareImages(file1, file2) {
  console.log("Comparing images:", file1, file2);

  const desc1 = await getEmbeddings(file1);
  const desc2 = await getEmbeddings(file2);

  const distance = faceapi.euclideanDistance(desc1[0], desc2[0]);
  console.log("L2 distance between most prominent detected faces:", distance);
  console.log(
    "Similarity between most prominent detected faces:",
    1 - distance
  );
}

const indexData = async (collection: any) => {
  const files = fs.readdirSync("images");

  const promises = files.map((file) =>
    indexAllFaces(path.join("images", file), file, collection)
  );

  await Promise.all(promises);
  console.log("All images indexed.");
};

export const searchImages = async (imageURL: string) => {
  const client = new ChromaClient({ path: "http://100.25.138.192:3030" });
  await initializeFaceModels();

  const collection = await client.getOrCreateCollection({
    name: "face-api",
    metadata: { "hnsw:space": "l2" },
  });

  console.log(`\nSearching for top matches for the image at URL: ${imageURL}`);
  const matches = await findTopKMatches(collection, imageURL, 5);

  return matches;
};
