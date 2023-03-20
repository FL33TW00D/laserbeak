import { s3Client } from "./s3Client";
import { createRequest } from "@aws-sdk/util-create-request";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { S3RequestPresigner } from "@aws-sdk/s3-request-presigner";
import { formatUrl } from "@aws-sdk/util-format-url";

const getObjectUrl = async (fileName: string) => {
  const request = await createRequest(
    s3Client,
    new GetObjectCommand({
      Key: fileName,
      Bucket: "rumble",
    })
  );

  const signer = new S3RequestPresigner({
    ...s3Client.config,
  });

  const url = await signer.presign(request);
  return formatUrl(url);
};

export { getObjectUrl };
