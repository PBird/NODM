export interface CursorOptions {
  limit?: number;
  skip?: number;
  projection?: { [key: string]: number };
  sort?: { [key: string]: number };
}

export interface FindOptions extends CursorOptions {}
