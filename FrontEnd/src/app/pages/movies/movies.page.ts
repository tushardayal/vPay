import { Component, OnInit } from '@angular/core';
import {MovieService} from 'src/app/services/movie.service';

@Component({
  selector: 'app-movies',
  templateUrl: './movies.page.html',
  styleUrls: ['./movies.page.scss'],
})
export class MoviesPage implements OnInit {
  movies = [];
  currentPage = 1;

  constructor(private movieService:MovieService) { }

  ngOnInit() {
    this.movieService.getTopRateMovies(this.currentPage).subscribe((res) => {
      console.log(res);
    })
  }
  
}
