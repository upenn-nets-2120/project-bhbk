const express = require("express");
const { Kafka, EachMessagePayload, CompressionTypes, CompressionCodecs } = require("kafkajs");

const SnappyCodec = require('kafkajs-snappy')

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["127.0.0.1:9092"],
});

const consumer = kafka.consumer({
  groupId: "nets-2120-group-a",
  bootstrapServers: ["127.0.0.1:9092"],
});

const kafka_messages = [];

const run = async () => {
  // Consuming
  await consumer.connect();
  console.log(`Following topic sample-topic`);
  await consumer.subscribe({ topic: "Twitter-Kafka", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      kafka_messages.push({
        value: message.value.toString(),
      });
      console.log({
        value: message.value.toString(),
      });
    },
  });
};

run().catch(console.error);
