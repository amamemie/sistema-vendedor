import { api } from './api';

export const authService = {
  login: (email, password) =>
    api.post('login.php', { email, password }),

  register: (formData) =>
    api.post('crear_usuario.php', formData),
};
