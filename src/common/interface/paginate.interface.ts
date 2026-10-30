import { HydratedDocument } from "mongoose";

export interface Ipaginate<T> {
  count: number;
  limit: number;
  pages: number;
  currentPage: number;
  docs: T[];
}
