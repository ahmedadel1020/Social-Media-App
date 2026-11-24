import {
  CompleteMultipartUploadCommandOutput,
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  DeleteObjectsCommand,
  DeleteObjectsCommandOutput,
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  ListObjectsV2CommandOutput,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  APPLICATION_NAME,
  AWS_ACCESS_KEY_ID,
  AWS_BUCKET_NAME,
  AWS_EXPIRES_IN,
  AWS_REGION,
  AWS_SECRET_ACCESS_KEY,
} from "../../config";
import { randomUUID } from "node:crypto";
import { BadRequestException } from "../exception/domain.exception";
import { IFile } from "../types/multer.types";
import { Progress, Upload } from "@aws-sdk/lib-storage";
import { StorageApproachEnum } from "../enum/multer.enum";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export class CloudService {
  private cloudClient: S3Client;
  constructor() {
    this.cloudClient = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
    });
  }
  private generateKey({
    path = "public",
    file,
  }: {
    file: IFile;
    path?: string;
  }) {
    return `${APPLICATION_NAME}/${path}/${randomUUID()}__${file.originalname}`;
  }
  async uploadAsset({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    file,
    path = "public",
  }: {
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    path?: string;
    Bucket?: string;
  }): Promise<string> {
    const command = new PutObjectCommand({
      Bucket,
      Key: this.generateKey({ path, file }),
      ACL,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.cloudClient.send(command);
    if (!command.input.Key) {
      throw new BadRequestException("Fail to upload this asset");
    }
    return command.input.Key;
  }

  async uploadLargeAsset({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    file,
    path = "public",
    partSize = 5,
  }: {
    file: Express.Multer.File;
    ACL?: ObjectCannedACL;
    path?: string;
    Bucket?: string;
    partSize?: number;
  }): Promise<CompleteMultipartUploadCommandOutput> {
    const upload = new Upload({
      client: this.cloudClient,
      params: {
        Bucket,
        Key: this.generateKey({ path, file }),
        ACL,
        Body: file.buffer,
        ContentType: file.mimetype,
      },
      partSize: partSize * 1024 * 1024,
    });

    upload.on("httpUploadProgress", (progress: Progress) => {
      console.log(
        `Upload file is   ${((progress.loaded as number) / (progress.total as number)) * 100}  % `,
      );
    });

    return await upload.done();
  }

  async uploadAssets({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    path = "general",
    files,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
  }): Promise<string[]> {
    return await Promise.all(
      files.map((file) => this.uploadAsset({ file, ACL, Bucket, path })),
    );
  }

  async uploadLargeAssets({
    Bucket = AWS_BUCKET_NAME,
    ACL = ObjectCannedACL.private,
    path = "general",
    files,
    partSize = 5,
  }: {
    Bucket?: string;
    ACL?: ObjectCannedACL;
    path?: string;
    files: Express.Multer.File[];
    partSize?: number;
  }): Promise<string[]> {
    const result = await Promise.all(
      files.map((file) =>
        this.uploadLargeAsset({ file, ACL, Bucket, path, partSize }),
      ),
    );
    return result.map((ele) => ele.Key) as string[];
  }

  async getAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<GetObjectCommandOutput> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
    });

    return await this.cloudClient.send(command);
  }

  async deleteAsset({
    Bucket = AWS_BUCKET_NAME,
    Key,
  }: {
    Bucket?: string;
    Key: string;
  }): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket,
      Key,
    });

    return await this.cloudClient.send(command);
  }

  async deleteAssets({
    Bucket = AWS_BUCKET_NAME,
    Keys,
  }: {
    Bucket?: string;
    Keys: string[];
  }): Promise<DeleteObjectsCommandOutput> {
    const command = new DeleteObjectsCommand({
      Bucket,
      Delete: {
        Objects: Keys.map((key) => {
          return { Key: key };
        }),
      },
    });

    return await this.cloudClient.send(command);
  }

  async listFolderDir({
    Bucket = AWS_BUCKET_NAME,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<ListObjectsV2CommandOutput> {
    const command = new ListObjectsV2Command({
      Bucket,
      Prefix: `${APPLICATION_NAME}/${prefix}`,
    });

    return await this.cloudClient.send(command);
  }

  async deleteFolderByPrefix({
    Bucket = AWS_BUCKET_NAME,
    prefix,
  }: {
    Bucket?: string;
    prefix: string;
  }): Promise<DeleteObjectsCommandOutput> {
    const { Contents } = await this.listFolderDir({ Bucket, prefix });
    const Keys = Contents?.map((ele) => ele.Key as string) || [];
    return await this.deleteAssets({ Bucket, Keys });
  }

  async createPreSignedUploadLink({
    Bucket = AWS_BUCKET_NAME,
    path = "general",
    Originalname,
    ContentType,
    expiresIn = AWS_EXPIRES_IN,
  }: {
    Bucket?: string;
    path?: string;
    Originalname: string;
    ContentType: string;
    expiresIn?: number;
  }): Promise<{ Key: string; url: string }> {
    const command = new PutObjectCommand({
      Bucket,
      Key: this.generateKey({
        path,
        file: { originalname: Originalname } as IFile,
      }),
      ContentType,
    });

    if (!command.input.Key) {
      throw new BadRequestException("Fail to upload this asset");
    }
    const url = await getSignedUrl(this.cloudClient, command, { expiresIn });
    return { url, Key: command.input.Key };
  }

  async createPreSignedFetchLink({
    Bucket = AWS_BUCKET_NAME,
    Key,
    expiresIn = AWS_EXPIRES_IN,
    download,
    fileName,
  }: {
    Bucket?: string;
    Key: string;
    expiresIn?: number;
    download?: "true" | "false";
    fileName?: string | undefined;
  }): Promise<string> {
    const command = new GetObjectCommand({
      Bucket,
      Key,
      ResponseContentDisposition:
        download === "true" ? `attachment; filename="${fileName}"` : undefined,
    });

    const url = await getSignedUrl(this.cloudClient, command, { expiresIn });
    return url;
  }
}

export const cloudService = new CloudService();
