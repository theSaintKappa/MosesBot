import secrets from "@/utils/secrets";
import { Storage } from "@google-cloud/storage";

const { project_id, client_email, private_key, bucket_name } = secrets.gcp;

export const storage = new Storage({ credentials: { project_id, client_email, private_key } });

export const bucket = storage.bucket(bucket_name);
