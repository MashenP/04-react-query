import { useState } from 'react';
import type { ComponentType } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import ReactPaginateModule from 'react-paginate';
import type { ReactPaginateProps } from 'react-paginate';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import Loader from '../Loader/Loader';
import MovieGrid from '../MovieGrid/MovieGrid';
import MovieModal from '../MovieModal/MovieModal';
import SearchBar from '../SearchBar/SearchBar';
import { fetchMovies } from '../../services/movieService';
import type { Movie } from '../../types/movie';
import css from './App.module.css';

type ModuleWithDefault<T> = { default: T };

const ReactPaginate = (
  ReactPaginateModule as unknown as ModuleWithDefault<ComponentType<ReactPaginateProps>>
).default;

export default function App() {
  const [query, setQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['movies', query, page],
    queryFn: () => fetchMovies(query, page),
    enabled: query !== '',
    placeholderData: previousData => previousData,
  });
  
  const totalPages = data?.total_pages ?? 0;

  const handleSearch = (newQuery: string): void => {
    if (newQuery.trim() === '') {
      toast.error('No movies found for your request.');
      return;
    }
    
    setQuery(newQuery);
    setPage(1);
  };

  const handleSelectMovie = (movie: Movie): void => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = (): void => {
    setSelectedMovie(null);
  };

  return (
    <div className={css.app}>
      <SearchBar onSubmit={handleSearch} />

      {isLoading && <Loader />}
      {isError && <ErrorMessage />}
      {data && data.results.length > 0 && (
        <>
          <MovieGrid movies={data.results} onSelect={handleSelectMovie} />
          {totalPages > 1 && (
            <ReactPaginate
              pageCount={totalPages}
              pageRangeDisplayed={5}
              marginPagesDisplayed={1}
              onPageChange={({ selected }) => setPage(selected + 1)}
              forcePage={page - 1}
              containerClassName={css.pagination}
              activeClassName={css.active}
              nextLabel="→"
              previousLabel="←"
            />
          )}
        </>
      )}

      {isFetching && !isLoading && <Loader/>}
      {selectedMovie && (
        <MovieModal movie={selectedMovie} onClose={handleCloseModal} />
      )}

      <Toaster position="top-center" />
    </div>
  );
}