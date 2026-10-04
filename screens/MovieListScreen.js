import { TMDB_API_KEY } from '../config/tmdb';
import { StyleSheet, Text, View, Image, FlatList, TextInput, Pressable, Modal, TouchableOpacity, ScrollView } from 'react-native';
import React, { useState, useEffect } from 'react';
import Stars from '../shared/Stars';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

export default function MovieListScreen({ navigation }) {
  const [movies, setMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [modalVisible, setModalVisible] = useState(false);
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);

  useEffect(() => {
    fetchMovies();
  }, [category, sortOption]);

  const fetchMovies = async () => {
    try {
      const API_KEY = TMDB_API_KEY;
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=${sortOption}${category ? `&with_genres=${category}` : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        const moviesData = data.results;

        // Fetch additional details for each movie
        const detailedMoviesData = await Promise.all(
          moviesData.map(async (movie) => {
            const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=es-ES&append_to_response=credits`;
            const detailsResponse = await fetch(detailsUrl);
            const detailsData = await detailsResponse.json();
            return { 
              ...movie, 
              director: detailsData.credits?.crew?.find(crew => crew.job === 'Director')?.name || 'Desconocido', 
              releaseDate: detailsData.release_date 
            };
          })
        );

        setMovies(detailedMoviesData);
      } else {
        console.log('Error al obtener datos:', response.status);
      }
    } catch (error) {
      console.error('Error al obtener datos:', error);
    }
  };

  const searchMovies = async (query) => {
    if (query.length > 0) {
      try {
        const API_KEY = TMDB_API_KEY;
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&language=es-ES&query=${query}&page=1&include_adult=false`;

        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          const moviesData = data.results;

          // Fetch additional details for each movie
          const detailedMoviesData = await Promise.all(
            moviesData.map(async (movie) => {
              const detailsUrl = `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=es-ES&append_to_response=credits`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();
              return { 
                ...movie, 
                director: detailsData.credits?.crew?.find(crew => crew.job === 'Director')?.name || 'Desconocido', 
                releaseDate: detailsData.release_date 
              };
            })
          );

          setSearchResults(detailedMoviesData);
        } else {
          console.log('Error al obtener datos:', response.status);
        }
      } catch (error) {
        console.error('Error al obtener datos:', error);
      }
    } else {
      setSearchResults([]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Buscar por nombre"
            value={search}
            onChangeText={(text) => {
              setSearch(text);
              searchMovies(text);
            }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => {
              setSearch('');
              setSearchResults([]);
            }} style={styles.clearButton}>
              <Ionicons name="close-circle" size={24} color="gray" />
            </TouchableOpacity>
          )}
        </View>
        <Pressable style={styles.filterButton} onPress={() => setModalVisible(true)}>
          <Ionicons name="filter" size={24} color="white" />
        </Pressable>
      </View>
      <Text style={styles.title2}>Películas Populares</Text>
      {searchResults.length > 0 && search.length > 0 && (
        <View style={styles.searchResultsContainer}>
          <ScrollView>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.searchResultItem}
                onPress={() => {
                  setSearch('');
                  setSearchResults([]);
                  navigation.navigate('MovieDetailScreen', {
                    movieId: item.id,
                    title: item.title,
                    overview: item.overview,
                    releaseDate: item.release_date,
                    backdropPath: item.backdrop_path,
                    voteAverage: item.vote_average,
                    genreIds: item.genre_ids,
                    director: item.director,
                  });
                }}
              >
                <Image
                  source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }}
                  style={styles.searchResultImage}
                />
                <View style={styles.searchResultTextContainer}>
                  <Text style={styles.searchResultText}>{item.title}</Text>
                  <Text style={styles.searchResultSubText}>Director: {item.director}</Text>
                  <Text style={styles.searchResultSubText}>Fecha de Estreno: {item.releaseDate}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      <FlatList
        data={movies}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            style={styles.item}
            onPress={() =>
              navigation.navigate('MovieDetailScreen', {
                movieId: item.id,
                title: item.title,
                overview: item.overview,
                releaseDate: item.release_date,
                backdropPath: item.backdrop_path,
                voteAverage: item.vote_average,
                genreIds: item.genre_ids,
                director: item.director,
              })
            }
          >
            <Image
              source={{ uri: `https://image.tmdb.org/t/p/w500/${item.poster_path}` }}
              style={styles.poster}
            />
            <View>
              <Text style={styles.title}>{`${index + 1}. ${item.title}`}</Text>
              <Text style={styles.subtitle}>Director: {item.director}</Text>
              <Text style={styles.subtitle}>Fecha de Estreno: {item.releaseDate}</Text>
              <Stars title="Calificación Promedio" rating={item.vote_average / 2} />
            </View>
          </TouchableOpacity>
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Filtrar por:</Text>
          <View style={styles.pickerContainer}>
            <Text style={styles.pickerLabel}></Text>
            <Pressable style={styles.pickerButton} onPress={() => setCategoryPickerVisible(true)}>
              <Text style={styles.pickerButtonText}>{category ? category : 'Seleccionar Categoría'}</Text>
            </Pressable>
          </View>
          <Pressable
            style={[styles.button, styles.buttonClose]}
            onPress={() => setModalVisible(!modalVisible)}
          >
            <Text style={styles.textStyle}>Aplicar</Text>
          </Pressable>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={categoryPickerVisible}
        onRequestClose={() => {
          setCategoryPickerVisible(!categoryPickerVisible);
        }}
      >
        <View style={styles.pickerModalView}>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={category}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setCategory(itemValue);
                setCategoryPickerVisible(false);
              }}
            >
              <Picker.Item label="Todas las Categorías" value="" color="black" />
              <Picker.Item label="Acción" value="28" color="black" />
              <Picker.Item label="Drama" value="18" color="black" />
              <Picker.Item label="Misterio" value="9648" color="black" />
              {/* Add more categories as needed */}
            </Picker>
            <Pressable
              style={[styles.button, styles.buttonClose]}
              onPress={() => setCategoryPickerVisible(false)}
            >
              <Text style={styles.textStyle}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 25,
    backgroundColor: '#f8f8f8',
  },
  title2: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 10,
    marginLeft: 10,
    color: '#333',
  },
  item: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 10,
  },
  poster: {
    width: 75,
    height: 125,
    marginRight: 10,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
    position: 'relative',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    flex: 1,
    borderRadius: 10,
    backgroundColor: '#fff',
  },
  clearButton: {
    position: 'absolute',
    right: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 12,
    marginBottom: 10,
  },
  searchResultsContainer: {
    backgroundColor: 'white',
    position: 'absolute',
    top: 67,
    left: 0,
    right: 0,
    zIndex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    maxHeight: 550,
    borderRadius: 10,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  searchResultImage: {
    width: 50,
    height: 75,
    marginRight: 10,
    borderRadius: 10,
  },
  searchResultTextContainer: {
    flex: 1,
  },
  searchResultText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  searchResultSubText: {
    fontSize: 14,
    color: '#777',
  },
  filterButton: {
    backgroundColor: '#FFA500',
    padding: 10,
    borderRadius: 10,
    marginLeft: 10,
  },
  filterButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    top: 100,
  },
  pickerModalView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '50%',
  },
  pickerLabel: {
    fontSize: 16,
    marginRight: 10,
  },
  picker: {
    width: '100%',
    height: 150,
  },
  pickerButton: {
    flexDirection: 'row',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000',
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    marginTop: 10,
  },
  buttonClose: {
    backgroundColor: '#FFA500',
    marginTop: 10,
  },
  textStyle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
  },
});