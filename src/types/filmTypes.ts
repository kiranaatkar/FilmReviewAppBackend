export type User = {
  id: number;
  username: string;
  hashedPassword: string;
  createdAt: Date;
};

export interface Genre {
  id: number;
  name: string;
}

export interface Actor {
  id: number;
  name: string;
}

export interface Director {
  id: number;
  name: string;
}

export interface Film {
  id: number;
  title: string;
  year: number;
  posterUrl: string;
  runtime: number;
  genres: Genre[];
  directors: Director[];
  actors: Actor[];
}


export type Rating = {
  id?: number;
  userId: number;
  filmId: number;
  points: RatingPoint[];
};

export interface RatingPoint {
  id?: number;
  point_index: number;
  x: number;
  y: number;
}
