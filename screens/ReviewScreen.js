import { TMDB_API_KEY } from '../config/tmdb';
import { StyleSheet, View, Text, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import MovieReviewForm from '../shared/MovieReviewForm';

export default function ReviewScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [series, setSeries] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [comment, setComment] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchPopularMovies();
    fetchPopularSeries();
  }, []);

  const fetchPopularMovies = async () => {
    try {
      const API_KEY = TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=es-ES&page=1`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setMovies(data.results);
      } else {
        console.log('Error al obtener datos:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const fetchPopularSeries = async () => {
    try {
      const API_KEY = TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/tv/popular?api_key=${API_KEY}&language=es-ES&page=1`;
      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        setSeries(data.results);
      } else {
        console.log('Error al obtener datos:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const searchItems = async (query) => {
    if (query.length > 0) {
      try {
        const API_KEY = TMDB_API_KEY;
        const movieUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}&page=1&include_adult=false`;
        const seriesUrl = `https://api.themoviedb.org/3/search/tv?api_key=${API_KEY}&language=es-ES&query=${query}&page=1&include_adult=false`;

        const [movieResponse, seriesResponse] = await Promise.all([fetch(movieUrl), fetch(seriesUrl)]);

        if (movieResponse.ok && seriesResponse.ok) {
          const movieData = await movieResponse.json();
          const seriesData = await seriesResponse.json();
          setSearchResults([...movieData.results, ...seriesData.results]);
        } else {
          console.log('Error al obtener datos:', movieResponse.status, seriesResponse.status);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}></Text>
      <MovieReviewForm
        setSelectedMovie={setSelectedItem}
        selectedMovie={selectedItem}
        comment={comment}
        setComment={setComment}
        search={search}
        setSearch={setSearch}
        searchResults={searchResults}
        setSearchResults={setSearchResults}
        searchItems={searchItems}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: '#f8f8f8',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
});