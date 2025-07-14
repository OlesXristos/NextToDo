import axios from 'axios';

export const axiosInstance = axios.create({
  //ВСТАНОВЛЕННЯ БАЗОВОГО URL ДЛЯ ЗАПИТІВ ЗАВДЯКИ ЗМІННІЙ ДЛЯ ЗРУЧНОСТІ
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});
