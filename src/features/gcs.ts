import { Storage } from "@google-cloud/storage";
import secrets from "../utils/secrets";

export const storage = new Storage({
    projectId: secrets.googleCredentials.project_id,
    credentials: secrets.googleCredentials,
});

export const bucket = storage.bucket(secrets.googleCredentials.bucket_name);
