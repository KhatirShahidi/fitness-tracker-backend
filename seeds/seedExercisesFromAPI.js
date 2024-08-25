import fetch from 'node-fetch';
import database from '../database/connection.js';

async function seedExercisesFromAPI() {
    try {
        let url = 'https://wger.de/api/v2/exercise/?format=json&language=2&limit=100';
        let moreData = true;

        while (moreData) {
            const response = await fetch(url);
            const data = await response.json();

            const insertExerciseSQL = `
                INSERT INTO exercises (exercise_name, exercise_type)
                VALUES ($1, $2) RETURNING *;
            `;

            for (const exercise of data.results) {
                const exerciseType = exercise.category.name || 'General'; // Handle missing category
                await database.query(insertExerciseSQL, [exercise.name, exerciseType]);
            }

            // Check if there is a next page of data
            if (data.next) {
                url = data.next; // Move to the next page of the API results
            } else {
                moreData = false; // No more data to fetch
            }
        }

        console.log('Exercises from API have been added successfully');
    } catch (error) {
        console.error('Error fetching exercises from API:', error);
    }
}

seedExercisesFromAPI();
