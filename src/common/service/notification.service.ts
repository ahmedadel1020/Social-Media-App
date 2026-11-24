import { App, cert, initializeApp } from "firebase-admin";
import { getMessaging } from "firebase-admin/messaging";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import cacheService, { CahcheService } from "./cache.service";
import mongoose from "mongoose";
type userIdType = mongoose.Types.ObjectId | string;
export class NotificationService {
  private cacheService: CahcheService;
  private client: App;
  constructor() {
    this.cacheService = cacheService;
    this.client = initializeApp({
      credential: cert(
        JSON.parse(
          readFileSync(
            resolve(
              "./src/config/social-app-1effb-firebase-adminsdk-fbsvc-0e8cd7b173.json",
            ),
          ) as unknown as string,
        ),
      ),
    });
  }

  Key({ userId }: { userId: userIdType }) {
    return `user:FCM:${userId.toString()}`;
  }

  async addFCM({ userId, FCM }: { userId: userIdType; FCM: string }) {
    return await this.cacheService.sAdd({
      key: this.Key({ userId }),
      value: FCM,
    });
  }

  async removeFCM({ userId, FCM }: { userId: userIdType; FCM: string }) {
    return await this.cacheService.sRem({
      key: this.Key({ userId }),
      value: FCM,
    });
  }

  async getFCMS({ userId }: { userId: userIdType }) {
    return await this.cacheService.sMembers({ key: this.Key({ userId }) });
  }

  async hasFCMS({ userId }: { userId: userIdType }) {
    return await this.cacheService.sCard({ key: this.Key({ userId }) });
  }
  async removeFCMUser({ userId }: { userId: userIdType }) {
    return await this.cacheService.del({ key: this.Key({ userId }) });
  }

  async sendNotification({
    token,
    notification,
  }: {
    token: string;
    notification: { title: string; body: string; imageUrl?: string };
  }) {
    return await getMessaging(this.client).send({ token, notification });
  }

  async sendNotifications({
    tokens,
    notification,
  }: {
    tokens: string[];
    notification: { title: string; body: string; imageUrl?: string };
  }) {
    return await Promise.allSettled(
      tokens.map((token) => {
        getMessaging(this.client).send({ token, notification });
      }),
    );
  }
}

export const notificationService = new NotificationService();
