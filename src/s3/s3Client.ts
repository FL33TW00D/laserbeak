import { S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: "auto",
  credentials: {
    accessKeyId: "16a0b87132df810318c70b211964fe86",
    secretAccessKey: "2fb35087cf8bf9e239b9b75317953e962ec51f706322acc210426233fe010e97",
  }
});

export { s3Client };
