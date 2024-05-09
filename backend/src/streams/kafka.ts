import { Kafka, EachMessagePayload, CompressionTypes, CompressionCodecs, EachBatchPayload } from "kafkajs";
import { SnappyCodec } from "kafkajs-snappy-typescript";

CompressionCodecs[CompressionTypes.Snappy] = new SnappyCodec().codec;

const kafka = new Kafka({
  clientId: "my-app",
  brokers: ["127.0.0.1:9092"],
});


interface KafkaMessage {
  topic: string;
  partition: number;
  message: {
    value: Buffer | null;
  };
}

export { kafka, KafkaMessage, EachMessagePayload, EachBatchPayload };