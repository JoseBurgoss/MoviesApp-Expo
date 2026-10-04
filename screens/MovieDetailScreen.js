import { TMDB_API_KEY } from '../config/tmdb';
import { StyleSheet, Text, View, Image, ScrollView, Pressable, TextInput, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import React, { useState, useEffect, useContext } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import Fontisto from '@expo/vector-icons/Fontisto';
import { collection, getDocs, query, where, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import FavoritesContext from '../context/FavoritesContext';
import AuthContext from '../context/AuthContext';
import Stars from '../shared/Stars';

export default function MovieDetailScreen({ route }) {
  const { title, overview, releaseDate, backdropPath, movieId } = route.params;
  const [heartPressed, setHeartPressed] = useState(false);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(0);
  const [reviewList, setReviewList] = useState([]);
  const [actors, setActors] = useState([]);
  const { user } = useContext(AuthContext);
  const { favorites, addFavorite, removeFavorite } = useContext(FavoritesContext);

  useEffect(() => {
    checkIfFavorite();
    getReviewList();
    fetchActors();
  }, [movieId]);

  const checkIfFavorite = () => {
    const isFavorite = favorites.some((fav) => fav.movieId === movieId);
    setHeartPressed(isFavorite);
  };

  const handleContainerPress = () => {
    Keyboard.dismiss();
  };

  const handleFavorite = async (e) => {
    e.preventDefault();
    if (!heartPressed) {
      setHeartPressed(true);
      await addFavorite({
        movieId,
        title,
        imgPath: `https://image.tmdb.org/t/p/w500/${backdropPath}`,
        overview,
        userId: user.uid,
      });
    } else {
      setHeartPressed(false);
      await removeFavorite(movieId);
    }
  };

  const fetchActors = async () => {
    try {
      const API_KEY = TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${API_KEY}`;
      const response = await fetch(url);
      const data = await response.json();
      setActors(data.cast);
    } catch (error) {
      console.error('Error al obtener actores:', error);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!review || rating === 0) {
      alert('Por favor escribe una reseña y selecciona una calificación.');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        movieId: movieId,
        userId: user.uid,
        comment: review,
        rating: rating,
        timestamp: new Date(),
      });
      alert('¡Reseña enviada exitosamente!');
      setReview('');
      setRating(0);
      getReviewList(); // Refresh the review list
    } catch (error) {
      console.error('Error al enviar la reseña:', error);
      alert('No se pudo enviar la reseña.');
    }
  };

  const getReviewList = async () => {
    try {
      const q = query(collection(db, "reviews"), where("movieId", "==", movieId));
      const data = await getDocs(q);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setReviewList(filteredData);
    } catch (err) {
      console.error('Error al obtener reseñas:', err);
    }
  };

  const handleStarPress = (value) => {
    setRating(value);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView>
        <View style={styles.container} onPress={handleContainerPress}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w500/${backdropPath}` }}
            style={styles.poster}
          />
          <Text style={styles.Headertext}>{title}</Text>
          <Text style={styles.text}>{overview}</Text>
          <Pressable style={styles.heart} onPress={handleFavorite}>
            {heartPressed ? (
              <Fontisto name="heart" size={24} color="red" />
            ) : (
              <FontAwesome6 name="heart" size={24} color="red" />
            )}
          </Pressable>

          <Text style={styles.sectionTitle}>Actores</Text>
          <View style={styles.actorsContainer}>
            <ScrollView horizontal>
              {actors.length > 0 ? (
                actors.map((actor, index) => (
                  <View key={index} style={styles.actorItem}>
                    <Image
                      source={{ uri: `https://image.tmdb.org/t/p/w500/${actor.profile_path}` }}
                      style={styles.actorImage}
                    />
                    <Text style={styles.actorName}>{actor.name}</Text>
                    <Text style={styles.actorCharacter}>como {actor.character}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.text}>No se encontraron actores.</Text>
              )}
            </ScrollView>
          </View>

          <Text style={styles.reviewHeader}>Agregar Reseña</Text>
          <TextInput
            placeholder="Escribe tu reseña"
            multiline
            numberOfLines={10}
            value={review}
            onChangeText={setReview}
            style={styles.input}
          />
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map((value) => (
              <TouchableOpacity key={value} onPress={() => handleStarPress(value)}>
                <Fontisto
                  name={value <= rating ? "star" : "star-outline"}
                  size={24}
                  color={value <= rating ? "#FFD700" : "#ccc"}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Pressable title="Enviar Reseña" onPress={handleReview} style={styles.button}>
            <Text style={styles.inputText}>Enviar Reseña</Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, flexDirection: 'column', marginTop: 50, marginBottom: 40 }}>
          <Text style={styles.reviewText}>{`Reseñas de la Película: ${title}`}</Text>
          {reviewList &&
            reviewList.map((review, index) => (
              <View style={styles.review} key={index}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewUser}>{user.displayName}</Text>
                  <Stars title="Calificación" rating={review.rating} />
                </View>
                <Text style={styles.reviewContent}>{review.comment}</Text>
              </View>
            ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
  },
  poster: {
    resizeMode: 'cover',
    width: '100%',
    height: 200,
  },
  Headertext: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 10 },
  text: { width: '100%', marginTop: 10, textAlign: 'center' },
  heart: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 18,
  },
  actorsContainer: {
    width: '100%',
    height: 200,
    bottom: 10,
  },
  actorItem: {
    flexDirection: 'column',
    alignItems: 'center',
    marginRight: 20,
  },
  actorImage: {
    width: 100,
    height: 150,
    borderRadius: 10,
    marginBottom: 10,
  },
  actorName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  actorCharacter: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  reviewHeader: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  input: {
    marginBottom: 20,
    width: '70%',
    padding: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#fff',
    top: 12,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285F4',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 1,
    minWidth: '70%',
    textAlign: 'center',
    justifyContent: 'center',
    height: 50,
    color: '#fff',
  },
  inputText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  review: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    marginVertical: 5,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: 300,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  reviewUser: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  reviewContent: {
    fontSize: 14,
    color: '#555',
  },
  reviewText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
});

