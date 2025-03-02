import { Movie, MovieTitle } from "../types/movieTypes";

class MovieService {
  static async getMovieTitles(): Promise<MovieTitle[]> {
    return [
      { id: 1, title: "LEG", year: 2025 },
      { id: 2, title: "Matrix", year: 1999 },
    ];
  }

  static async getMovie(id: string): Promise<Movie | null> {
    return { id: 1, title: "LEG", year: 2025, posterUrl: "/assets/lighthouse.png" };
  }
}

export default MovieService;
