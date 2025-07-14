import { axiosInstance } from './instance';
import { ApiRoutes } from './constants';
import { User } from '@prisma/client';

//ФУНКЦІЯ ПОШУКУ (ЗАПИТ ДО СЕРВЕРНОГО АПІ)
export const search = async (query: string): Promise<User[]> => {
  //ПОШУК ТА ПОВЕРНЕННЯ ВІДПОВІДЬ ВІД СЕРВЕРНОГО АПІ
  return (await axiosInstance.get<User[]>(ApiRoutes.SEARCH_USERS, { params: { query } })).data;
};
