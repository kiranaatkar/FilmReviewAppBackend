export type User = {
    id: number;
    username: string;
    hashedPassword: string;
    createdAt: Date;
  }

export interface Film {
    id: number;
    title: string;
    year: number;
    posterUrl: string;
  }

  export type Rating = {
    id?: number;
    userId: number;
    filmId: number;
    points: RatingPoint[];
  }
  
  export interface RatingPoint {
    id?: number;
    point_index: number;
    x: number;
    y: number;
  }
  